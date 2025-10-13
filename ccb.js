import plugin from "../../lib/plugins/plugin.js";
import { segment } from "oicq";

// =================================================================================================================
// 配置文件
// =================================================================================================================
const config = {
    // 防滥用设置
    yw_window: 60, // 滑动窗口长度（秒）
    yw_threshold: 10, // 在`yw_window`秒内，允许操作的最大次数
    yw_ban_duration: 1800, // 触发防滥用后的冷却时长（秒），默认30分钟
    yw_probability: 0.1, // 每次使用`#ccb`后，触发冷却（养胃）的概率

    // 功能参数
    self_ccb: false, // 是否允许对自己使用ccb（#ccb不@任何人时）
    crit_prob: 0.15, // 触发暴击（双倍注入量）的概率
    is_log: false, // 是否开启详细日志记录 (暂未实现)
    white_list: [12345678, 114514], // 白名单QQ号，拥有sudo权限且免疫ccb

    // XNN榜单权重
    w_num: 1.0, // 被ccb次数权重
    w_vol: 0.1, // 被注入量权重
    w_action: 0.5, // ccb他人次数权重（负权重）
};

// 内部变量
const DATA_KEY_PREFIX = "Yunzai:AstrBot:ccb_plus";
const LOG_KEY = "Yunzai:AstrBot:ccb_plus_log";
const action_times = {};
const ban_list = {};
const a1 = "id",
    a2 = "num",
    a3 = "vol",
    a4 = "ccb_by",
    a5 = "max";

export class ccb extends plugin {
    constructor() {
        super({
            name: "ccb插件增强版",
            dsc: "移植自AstrBot的ccb_plus插件",
            event: "message",
            priority: 50,
            rule: [
                { reg: "^#?ccbtop$", fnc: "ccbtop" },
                { reg: "^#?ccbvol$", fnc: "ccbvol" },
                { reg: "^#?ccbinfo(.*)$", fnc: "ccbinfo" },
                { reg: "^#?ccbmax$", fnc: "ccbmax" },
                { reg: "^#?xnn$", fnc: "xnn" },
                { reg: "^#?sudo ccb(.*)$", fnc: "sudoCcb" },
                { reg: "^#?ccb(.*)$", fnc: "ccb" },
            ],
        });
    }

    // =================================================================================================================
    // 核心辅助函数
    // =================================================================================================================
    async readData(groupId) {
        try {
            const d = await redis.get(`${DATA_KEY_PREFIX}:${groupId}`);
            return d ? JSON.parse(d) : [];
        } catch {
            return [];
        }
    }
    async writeData(groupId, data) {
        try {
            await redis.set(
                `${DATA_KEY_PREFIX}:${groupId}`,
                JSON.stringify(data, null, 2),
            );
        } catch (e) {
            logger.error(e);
        }
    }

    async getNickname(e, userId) {
        if (!userId) return "未知";
        let uid_str = userId.toString();
        let nick = "";

        try {
            if (e.group) {
                const memberMap = await e.group.getMemberMap();
                const uid_num = parseInt(uid_str);
                const member = memberMap.get(uid_num) || memberMap.get(uid_str);

                if (member) {
                    nick = member.card || member.nickname;
                }
            }

            if (!nick) {
                const strangerInfo = await e.bot.getStrangerInfo(parseInt(uid_str));
                nick = strangerInfo.nickname;
            }
        } catch (error) {
            // 获取失败属于正常情况（如退群或查询失败），无需在控制台刷屏报错
        }

        if (nick && nick.trim()) {
            return `${nick.trim()} (${uid_str})`;
        } else {
            return uid_str;
        }
    }

    // =================================================================================================================
    // 指令实现
    // =================================================================================================================
    async ccb(e) {
        if (!e.group) return;

        if (e.atBot || (e.at && e.at.toString() === e.self_id.toString())) {
            await e.reply("机器人不能被ccb哦~", true);
            return;
        }

        if (!e.at) {
            await e.reply("请at你要cb的对象噢~", true);
            return;
        }

        const actorId = e.user_id.toString();
        const now = Date.now() / 1000;

        // 冷却和防滥用检查 (sudo命令会跳过这些)
        const banEnd = ban_list[actorId] || 0;
        if (now < banEnd) {
            const remain = Math.floor(banEnd - now);
            const m = Math.floor(remain / 60);
            const s = remain % 60;
            await e.reply(`嘻嘻，你已经一滴不剩了，养胃还剩 ${m}分${s}秒`, true);
            return;
        }
        const times = action_times[actorId] || (action_times[actorId] = []);
        while (times.length > 0 && now - times[0] > config.yw_window) {
            times.shift();
        }
        times.push(now);
        if (times.length > config.yw_threshold) {
            ban_list[actorId] = now + config.yw_ban_duration;
            action_times[actorId] = [];
            await e.reply("冲得出来吗你就冲，再冲就给你折了", true);
            return;
        }

        const targetUserId = e.at ? e.at.toString() : actorId;

        if (config.white_list.includes(parseInt(targetUserId))) {
            const nickname = await this.getNickname(e, targetUserId);
            await e.reply(`${nickname} 的后门被后户之神霸占了，不能ccb（悲`, true);
            return;
        }

        if (targetUserId === actorId && !config.self_cb) {
            await e.reply("兄啊金箔怎么还能捅到自己的啊（恼）", true);
            return;
        }

        // 调用核心执行函数
        await this.performCcbAction(e, targetUserId, actorId);

        // 随机养胃 (只对普通ccb生效)
        if (Math.random() < config.yw_probability) {
            ban_list[actorId] = now + config.yw_ban_duration;
            await e.reply("💥你的牛牛炸膛了！满身疮痍，再起不能（悲）", true);
        }
        return true;
    }

    async sudoCcb(e) {
        if (!e.group) return;

        const actorId = e.user_id;

        if (!config.white_list.includes(actorId)) {
            await e.reply("只有主人才可以强行ccb噢~", true);
            return;
        }

        if (e.atBot || (e.at && e.at.toString() === e.self_id.toString())) {
            await e.reply("机器人不能被ccb哦~", true);
            return;
        }

        if (!e.at) {
            await e.reply("请at你要cb的对象噢~", true);
            return;
        }

        const targetUserId = e.at.toString();
        // if (config.white_list.includes(parseInt(targetUserId))) {
        //     const nickname = await this.getNickname(e, targetUserId);
        //     await e.reply(`${nickname} 的后门受神之加护，无法被强行灼艾~`, true);
        //     return;
        // }

        // 执行核心操作
        await e.reply("允许主人强行灼艾...", true);
        await this.performCcbAction(e, targetUserId, actorId.toString());
        return true;
    }

    async performCcbAction(e, targetUserId, actorId) {
        const groupId = e.group_id.toString();
        const duration = (Math.random() * 59 + 1).toFixed(2);
        let V = Math.random() * 99 + 1;
        let isCrit = false;
        if (Math.random() < config.crit_prob) {
            V *= 2;
            isCrit = true;
        }
        V = parseFloat(V.toFixed(2));

        const pic = segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${targetUserId}`);
        const targetNickname = (await this.getNickname(e, targetUserId)).replace(` (${targetUserId})`, "");
        const groupData = await this.readData(groupId);
        let targetRecord = groupData.find((item) => item[a1] === targetUserId);

        if (targetRecord) {
            targetRecord[a2] = (targetRecord[a2] || 0) + 1;
            targetRecord[a3] = parseFloat(((targetRecord[a3] || 0) + V).toFixed(2));
            const ccb_by = targetRecord[a4] || {};
            if (ccb_by[actorId]) {
                ccb_by[actorId].count = (ccb_by[actorId].count || 0) + 1;
            } else {
                ccb_by[actorId] = { count: 1, first: false, max: false };
            }
            const prev_max = parseFloat(targetRecord[a5] || 0);
            if (V > prev_max) {
                targetRecord[a5] = V;
                Object.keys(ccb_by).forEach((id) => {
                    if (ccb_by[id]) ccb_by[id].max = false;
                });
                ccb_by[actorId].max = true;
            }
            targetRecord[a4] = ccb_by;
            let msg = [
                segment.at(actorId),
                `\n你和${targetNickname}发生了${duration}min长的ccb行为，向ta注入了${isCrit ? "💥 暴击！" : ""}${V.toFixed(2)}ml的生命因子\n`,
                pic,
                `\n这是ta的第${targetRecord[a2]}次。`,
            ];
            await e.reply(msg);
        } else {
            const newRecord = {
                [a1]: targetUserId, [a2]: 1, [a3]: V,
                [a4]: { [actorId]: { count: 1, first: true, max: true } },
                [a5]: V,
            };
            groupData.push(newRecord);
            let msg = [
                segment.at(actorId),
                `\n你和${targetNickname}发生了${duration}min长的ccb行为，向ta注入了${V.toFixed(2)}ml的生命因子\n`,
                pic,
                "\n这是ta的初体验。",
            ];
            await e.reply(msg);
        }
        await this.writeData(groupId, groupData);
    }



    async ccbtop(e) {
        if (!e.group) return;
        const groupData = await this.readData(e.group_id.toString());
        if (!groupData || groupData.length === 0)
            return e.reply("当前群暂无ccb记录。");
        const top5 = groupData
            .sort((x, y) => (y[a2] || 0) - (x[a2] || 0))
            .slice(0, 5);
        let msg = "被ccb排行榜 TOP5：\n";
        for (let i = 0; i < top5.length; i++) {
            const r = top5[i];
            const nick = await this.getNickname(e, r[a1]);
            msg += `${i + 1}. ${nick} - 次数：${r[a2]}\n`;
        }
        await e.reply(msg.trim());
        return true;
    }
    async ccbvol(e) {
        if (!e.group) return;
        const groupData = await this.readData(e.group_id.toString());
        if (!groupData || groupData.length === 0)
            return e.reply("当前群暂无ccb记录。");
        const top5 = groupData
            .sort((x, y) => (y[a3] || 0) - (x[a3] || 0))
            .slice(0, 5);
        let msg = "被注入量排行榜 TOP5：\n";
        for (let i = 0; i < top5.length; i++) {
            const r = top5[i];
            const nick = await this.getNickname(e, r[a1]);
            msg += `${i + 1}. ${nick} - 累计注入：${(r[a3] || 0).toFixed(2)}ml\n`;
        }
        await e.reply(msg.trim());
        return true;
    }
    async ccbinfo(e) {
        if (!e.group) return;
        const targetUserId = e.at ? e.at.toString() : e.user_id.toString();
        const groupData = await this.readData(e.group_id.toString());
        const record = groupData.find((r) => r[a1] === targetUserId);
        if (!record) return e.reply("该用户暂无ccb记录。");
        const targetNickname = await this.getNickname(e, targetUserId);
        const total_num = record[a2] || 0;
        const total_vol = record[a3] || 0;
        const max_val = record[a5] || 0;
        let cb_total = 0;
        groupData.forEach((rec) => {
            const by = rec[a4] || {};
            if (by[targetUserId]) cb_total += by[targetUserId].count || 0;
        });
        const ccb_by = record[a4] || {};
        let first_actor = Object.keys(ccb_by).find((id) => ccb_by[id].first);
        if (!first_actor && Object.keys(ccb_by).length > 0) {
            first_actor = Object.keys(ccb_by).reduce((a, b) =>
                (ccb_by[a].count || 0) > (ccb_by[b].count || 0) ? a : b,
            );
        }
        const first_nick = await this.getNickname(e, first_actor);
        const msg = `【${targetNickname}】的ccb信息\n• 破壁人：${first_nick}\n• 北朝：${total_num} 次\n• 朝壁：${cb_total} 次\n• 诗经：${total_vol.toFixed(2)} ml\n• 马克思：${max_val.toFixed(2)} ml`;
        await e.reply(msg);
        return true;
    }
    async ccbmax(e) {
        if (!e.group) return;
        const groupData = await this.readData(e.group_id.toString());
        if (!groupData || groupData.length === 0)
            return e.reply("当前群暂无ccb记录。");
        const sortedData = groupData
            .filter((r) => r[a5] && parseFloat(r[a5]) > 0)
            .sort((x, y) => (y[a5] || 0) - (x[a5] || 0));
        const top5 = sortedData.slice(0, 5);
        if (top5.length === 0) return e.reply("当前群暂无有效的最大注入记录。");
        let msg = "单次最大注入排行榜 TOP5：\n";
        for (let i = 0; i < top5.length; i++) {
            const r = top5[i];
            const max_val = r[a5] || 0;
            const nick = await this.getNickname(e, r[a1]);
            const ccb_by = r[a4] || {};
            let producer_id = Object.keys(ccb_by).find((id) => ccb_by[id].max);
            if (!producer_id && Object.keys(ccb_by).length > 0) {
                producer_id = Object.keys(ccb_by).reduce((a, b) =>
                    (ccb_by[a].count || 0) > (ccb_by[b].count || 0) ? a : b,
                );
            }
            const producer_nick = await this.getNickname(e, producer_id);
            msg += `${i + 1}. ${nick} - 单次最大：${max_val.toFixed(2)}ml（${producer_nick}）\n`;
        }
        await e.reply(msg.trim());
        return true;
    }
    async xnn(e) {
        if (!e.group) return;
        const groupData = await this.readData(e.group_id.toString());
        if (!groupData || groupData.length === 0)
            return e.reply("当前群暂无ccb记录。");
        const actor_actions = {};
        groupData.forEach((record) => {
            const ccb_by = record[a4] || {};
            Object.keys(ccb_by).forEach((actorId) => {
                actor_actions[actorId] =
                    (actor_actions[actorId] || 0) + (ccb_by[actorId].count || 0);
            });
        });
        const ranking = [];
        for (const record of groupData) {
            const uid = record[a1];
            const num = record[a2] || 0;
            const vol = record[a3] || 0;
            const actions = actor_actions[uid] || 0;
            const xnn_value =
                num * config.w_num + vol * config.w_vol - actions * config.w_action;
            ranking.push({ uid, xnn_value });
        }
        ranking.sort((a, b) => b.xnn_value - a.xnn_value);
        const top5 = ranking.slice(0, 5);
        let msg = "💎 小南梁 TOP5 💎\n";
        for (let i = 0; i < top5.length; i++) {
            const r = top5[i];
            const nick = await this.getNickname(e, r.uid);
            msg += `${i + 1}. ${nick} - XNN值：${r.xnn_value.toFixed(2)}\n`;
        }
        await e.reply(msg.trim());
        return true;
    }
}
