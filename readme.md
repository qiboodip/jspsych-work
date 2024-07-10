# jsPsych Stroop 实验教程

## 介绍

本教程将指导您使用 jsPsych 创建一个 Stroop 实验。教程分为三个部分：HTML、jsPsych 和 CSS。每个部分都包含详细的解释和代码示例，以帮助您有效地理解和实现实验。

------

## 1. HTML 文档

### 概述

HTML 文档是您的实验的骨架。它包括必要的元数据、外部库的链接以及网页的结构。

### 示例代码

```
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>stroop实验</title>
    <!-- 引入必要的 jsPsych 框架和插件 -->
    <script src="https://unpkg.com/jspsych@7.3.4"></script> <!-- 引入 jsPsych 框架 -->
    <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script> <!-- 键盘插件 -->
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" /><!-- jsPsych 样式表 -->
    <script src="https://unpkg.com/@jspsych/plugin-survey-html-form@1.0.3"></script> <!-- 信息填写插件 -->
    <script src="https://unpkg.com/@jspsych/plugin-survey-likert@1.1.3"></script> <!-- 量表插件 -->
    <script src="https://unpkg.com/@jspsych/plugin-fullscreen@1.2.1"></script><!-- 全屏插件 -->
    <script src="https://unpkg.com/@jspsych/plugin-html-button-response@1.2.0"></script><!-- 按钮插件 -->
    <link rel="stylesheet" href="./default.css">
</head>
<body>
    <script src="./scripts/exp.js"></script> <!-- 载入实验脚本 -->
</body>
</html>
```

### 解释

1. **文档类型和语言**：指定文档类型为 HTML5，语言为中文。
2. **字符集**：设置字符编码为 UTF-8。
3. **视口设置**：确保页面在不同设备上的正确显示。
4. **标题**：设置页面标题为 "stroop实验"。
5. **引入 jsPsych 框架和插件**：包括 jsPsych 框架和所需的插件（如键盘响应、调查表单、全屏模式等）。
6. **样式表**：引入 jsPsych 的样式表和自定义样式表 `default.css`。
7. **载入实验脚本**：在 body 标签中载入实验脚本 `exp.js`。

------

## 2. jsPsych 实验

### 概述

jsPsych 是一个用于创建行为实验的 JavaScript 库。我们将使用它来实现 Stroop 实验的各个部分，包括被试信息填写、全屏模式、指导语、试次设置和反馈。

### 示例代码

```
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
if (audioContext.state === 'suspended') { audioContext.resume(); }

let jsPsych = initJsPsych({
    override_safe_mode: true
});

// 被试信息填写
let subject_info = {
    type: jsPsychSurveyHtmlForm,
    preamble: '<h3>请填写以下信息</h3>',
    html: `
    <p>
        编号: <input name="subject_id" type="text" required><br>
        性别: <select name="gender" required>
            <option value="" disabled selected>选择性别</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
        </select><br>
        年龄: <input name="age" type="number" min="1" max="120" required><br>
        左/右利手: <select name="handedness" required>
            <option value="" disabled selected>选择利手</option>
            <option value="left">左手</option>
            <option value="right">右手</option>
        </select><br>
        学历: <select name="education" required>
            <option value="" disabled selected>选择学历</option>
            <option value="primary">小学</option>
            <option value="middle">初中</option>
            <option value="high">高中</option>
            <option value="bachelor">本科</option>
            <option value="master">硕士</option>
            <option value="phd">博士</option>
        </select>
    </p>
    `,
};

// 进入全屏
let enter_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: true
};

var exit_fullscreen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    delay_after: 1000
};

// 指导语
let instruction = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <div>
        <p>欢迎参加本实验。</p>
        <p>在实验中，屏幕中央会呈现一个词语，该词语表示一种颜色。</p>
        <p>你的任务是忽略词语的含义，尽快按键报告词语的字体颜色。</p>
        <p>如果词语的字体颜色是<span style="color: red;">红色</span>，请按 D 键</p>
        <p>如果词语的字体颜色是<span style="color: green;">绿色</span>，请按 F 键</p>
        <p>如果词语的字体颜色是<span style="color: yellow;">黄色</span>，请按 J 键</p>
        <p>如果词语的字体颜色是<span style="color: blue;">蓝色</span>，请按 K 键</p>
        <p>按任意键开始实验</p>
    </div>
    `,
    post_trial_gap: 500
};

// Stroop实验的试次
let fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p style="font-size: 36px;">+</p>',
    choices: "NO_KEYS",
    trial_duration: 500
};

let stroop_trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('word'),
    choices: ['d', 'f', 'j', 'k'],
    trial_duration: 1500,
    data: {
        word: jsPsych.timelineVariable('word_text'),
        color: jsPsych.timelineVariable('color'),
        congruency: jsPsych.timelineVariable('congruency'),
        block: jsPsych.timelineVariable('block')
    },
    on_finish: function(data){
        let correct = false;
        if(data.color == 'red' && data.response == 'd'){
            correct = true;
        } else if(data.color == 'green' && data.response == 'f'){
            correct = true;
        } else if(data.color == 'yellow' && data.response == 'j'){
            correct = true;
        } else if(data.color == 'blue' && data.response == 'k'){
            correct = true;
        }
        data.correct = correct;
    },
};

let feedback = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
        let last_trial_correct = jsPsych.data.get().last(1).values()[0].correct;
        if(last_trial_correct){
            return '<p style="color: green; font-size: 24px;">正确</p>';
        } else {
            return '<p style="color: red; font-size: 24px;">错误</p>';
        }
    },
    choices: "NO_KEYS",
    trial_duration: 500,
    post_trial_gap: 500
};

// 设置Stroop实验的时间线变量
let current_block = 1;
function createTimelineVariables(block) {
    return [
        { word: '<span style="color: red; font-size: 56px;">红</span>', color: 'red', congruency: 'congruent', word_text: '红', block: block },
        { word: '<span style="color: green; font-size: 56px;">绿</span>', color: 'green', congruency: 'congruent', word_text: '绿', block: block },
        { word: '<span style="color: yellow; font-size: 56px;">黄</span>', color: 'yellow', congruency: 'congruent', word_text: '黄', block: block },
        { word: '<span style="color: blue; font-size: 56px;">蓝</span>', color: 'blue', congruency: 'congruent', word_text: '蓝', block: block },
        { word: '<span style="color: red; font-size: 56px;">绿</span>', color: 'red', congruency: 'incongruent', word_text: '绿', block: block },
        { word: '<span style="color: green; font-size: 56px;">红</span>', color: 'green', congruency: 'incongruent', word_text: '红', block: block },
        { word: '<span style="color: yellow; font-size: 56px;">蓝</span>', color: 'yellow', congruency: 'incongruent', word_text: '蓝', block: block },
        { word: '<span style="color: blue; font-size: 56px;">黄</span>', color: 'blue', congruency: 'incongruent', word_text: '黄', block: block }
    ];
}

// 试次时间线
let block_timeline = {
    timeline: [fixation, stroop_trial, feedback],
    timeline_variables: createTimelineVariables(current_block),
    randomize_order: true
};

let blocks = {
    timeline: [block_timeline],
    repetitions: 3,
    on_timeline_finish: function() {
        current_block++;
        block_timeline.timeline_variables = createTimelineVariables(current_block);
    }
};

var stroop_procedure = {
    timeline: [block_timeline],
    repetitions: 1
};

let debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
        let trials = jsPsych.data.get().filter({trial_type: 'html-keyboard-response'});
        let correct_trials = trials.filter({correct: true});
        let accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        return `<p>实验结束！</p>
                <p>你的正确率是 ${accuracy}%</p>
                <p>按任意键结束实验</p>`;
    }
};

// 设置时间线
var timeline = [
    subject_info,
    enter_fullscreen,
    instruction,
    blocks,
    debrief_block,
    exit_fullscreen
];

// 启动实验
jsPsych.run(timeline);
```

### 解释

1. **初始化 jsPsych**：创建一个 jsPsych 实例。
2. **被试信息填写**：使用 `jsPsychSurveyHtmlForm` 插件，收集参与者的基本信息。
3. **全屏模式**：使用 `jsPsychFullscreen` 插件设置实验为全屏模式。
4. **指导语**：使用 `jsPsychHtmlKeyboardResponse` 插件显示实验指导语。
5. **实验试次**：使用 `jsPsychHtmlKeyboardResponse` 插件和时间线变量设置 Stroop 实验的各个试次。
6. **反馈**：根据参与者的反应提供反馈。
7. **结果汇总**：在实验结束时，显示参与者的准确率。

------

## 3. CSS 样式表

### 概述

CSS 样式表用于控制实验页面的外观，包括背景颜色、文本颜色、布局等。

### 示例代码

```
body {
    background-color: black; /* 背景色设置为黑色 */
    color: white; /* 文本颜色设置为白色 */
}

h3, p {
    font-family: Arial, sans-serif; /* 设置字体 */
}

input, select {
    color: black; /* 输入框和下拉菜单文本颜色 */
}

div {
    display: flex;
    flex-direction: column;
    align-items: center; /* 使用Flexbox居中对齐 */
    justify-content: center;
    min-height: 100vh;
}

form {
    display: flex;
    flex-direction: column;
    align-items: center; /* 使用Flexbox居中对齐 */
}

span {
    font-size: 56px; /* 设置字体大小为56px */
}
```

### 解释

1. **全局样式**：设置全局背景颜色为黑色，文本颜色为白色，使用 Arial 字体。
2. **输入框和下拉菜单**：设置输入框和下拉菜单的文本颜色为黑色。
3. **Flexbox 布局**：使用 Flexbox 布局居中对齐内容。
4. **字体大小**：设置实验中呈现的词语字体大小为 56px。

------

通过以上三个部分的代码和解释，您可以创建一个功能完备的 Stroop 实验。根据需要调整和扩展这些代码，以满足特定的实验需求。如果有任何问题，请随时提问。