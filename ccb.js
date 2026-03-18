import plugin from "../../lib/plugins/plugin.js";
import { segment } from "oicq";

const FAILED_CCB_IMAGE = "data:image/jpeg;base64,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";

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

    async replyFailedCcb(e, text, quote = true) {
        await e.reply([text, "\n", segment.image(FAILED_CCB_IMAGE)], quote);
    }

    // =================================================================================================================
    // 指令实现
    // =================================================================================================================
    async ccb(e) {
        if (!e.group) return;

        if (e.atBot || (e.at && e.at.toString() === e.self_id.toString())) {
            await this.replyFailedCcb(e, "机器人不能被ccb哦~");
            return;
        }

        if (!e.at) {
            await this.replyFailedCcb(e, "请at你要cb的对象噢~");
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
            await this.replyFailedCcb(
                e,
                `嘻嘻，你已经一滴不剩了，养胃还剩 ${m}分${s}秒`,
            );
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
            await this.replyFailedCcb(e, "冲得出来吗你就冲，再冲就给你折了");
            return;
        }

        const targetUserId = e.at ? e.at.toString() : actorId;

        if (config.white_list.includes(parseInt(targetUserId))) {
            const nickname = await this.getNickname(e, targetUserId);
            await this.replyFailedCcb(
                e,
                `${nickname} 的后门被后户之神霸占了，不能ccb（悲`,
            );
            return;
        }

        if (targetUserId === actorId && !config.self_cb) {
            await this.replyFailedCcb(e, "兄啊金箔怎么还能捅到自己的啊（恼）");
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
            await this.replyFailedCcb(e, "只有主人才可以强行ccb噢~");
            return;
        }

        if (e.atBot || (e.at && e.at.toString() === e.self_id.toString())) {
            await this.replyFailedCcb(e, "机器人不能被ccb哦~");
            return;
        }

        if (!e.at) {
            await this.replyFailedCcb(e, "请at你要cb的对象噢~");
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
