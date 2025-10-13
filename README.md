# Yunzai-Bot C! C! B! 插件🥵

这是一个为 [Yunzai-Bot](https://gitee.com/Le-niao/Yunzai-Bot) 开发的娱乐插件，移植并增强了原 AstrBot 上的插件 `astrbot_plugin_ccb_plus`。它允许群成员之间发生赛博 sex 🥰

## 灵感来源与致敬

本插件的核心玩法和创意灵感完全来自于 **[Koikokokokoro](https://github.com/Koikokokokoro)** 的 AstrBot 插件项目 `astrbot_plugin_ccb_plus`

**强烈推荐访问并支持原项目：**
[https://github.com/Koikokokokoro/astrbot_plugin_ccb_plus](https://github.com/Koikokokokoro/astrbot_plugin_ccb_plus)


## 安装说明

1.  下载本仓库中的 `ccb.js` 文件
2.  将 `ccb.js` 文件放置到您的 Yunzai-Bot 安装目录下的 `plugins/example/` 文件夹中
3.  **彻底重启** Yunzai-Bot
    * **注意**：为了确保插件被正确加载，建议完全停止机器人进程后再重新启动，而不是使用热重载。

## 配置说明

可以直接在 `ccb.js` 文件顶部的 `config` 对象中修改插件的各项参数，无需重启即可生效（白名单除外，修改后建议重启）

```javascript
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
```

## 指令用法

| 指令 | 效果 |
| :--- | :--- |
| **ccb [@目标]** | 对@的群友执行 ccb。必须@一个群友（回复消息 + ccb 也可） |
| **sudo ccb [@目标]** | **[白名单限定]** 无视冷却，强制对@的群友执行 ccb |
| **ccbtop** | 艾草排行榜 |
| **ccbvol** | 失荆州排行榜 |
| **ccbmax** | 单次最大输出榜 |
| **ccbinfo [@目标]** | 查询所有信息 |
| **xnn** | 小南梁榜 |

## 鸣谢

感谢 [Koikokokokoro](https://github.com/Koikokokokoro) 以及 Google Gemini 大爹 🥰