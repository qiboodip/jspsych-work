# jsPsych Stroop 实验教程

## 介绍

本教程将指导您使用 jsPsych 创建一个 Stroop 实验。教程分为三个部分：HTML、jsPsych 和 CSS。每个部分都包含详细的解释和代码示例，以帮助您有效地理解和实现实验。

我



------



## 1. HTML 文档

作为线上的框架，结合实验的需求，需要正确的引用插件，整体实验代码如下（均已作出注释）：

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8"> <!-- 设置页面字符集为UTF-8，支持中文和其他Unicode字符 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- 设置页面在移动设备上的视口和缩放级别 -->
    <title>stroop实验</title> <!-- 设置页面标题 -->

    <!-- 引入jsPsych框架及其插件 -->
    <script src="https://unpkg.com/jspsych@7.3.4"></script> <!-- 引入jsPsych核心框架 -->
    <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.3"></script> <!-- 键盘响应插件 -->
    <script src="https://unpkg.com/@jspsych/plugin-survey-html-form@1.0.3"></script> <!-- 信息填写插件 -->
    <script src="https://unpkg.com/@jspsych/plugin-survey-likert@1.1.3"></script> <!-- 量表插件 -->
    <script src="https://unpkg.com/@jspsych/plugin-fullscreen@1.2.1"></script><!--全屏插件-->
    <script src="https://unpkg.com/@jspsych/plugin-html-button-response@1.2.0"></script><!--按钮插件-->
    <link href="https://unpkg.com/jspsych@7.3.4/css/jspsych.css" rel="stylesheet" type="text/css" /><!--jspsych样式表-->
    <link rel="stylesheet" href="./default.css"> <!-- 引入自定义CSS样式表 -->

</head>
<body>
    <div id="main-container">
        <script src="./scripts/exp.js"></script> <!-- 载入实验脚本exp.js -->
    </div>
</body>
</html>
```

------

## 2. jsPsych 实验

我们要清楚实验的流程，首先是需要收集被试的信息，然后是实验的指导语部分，接着便是实验部分，在此我们设计的是一个练习实验，而不是一个完整的实验。最后是结束语，注意，在本实验中，我们目的是想被试在练习中达到一定的准确率才可以进入正式实验，所以在这里我们设定了正确率条件必须达到80%及以上。

实验部分，被试需要对文字（红、绿、黄、蓝）x 一致性（一致、不一致）八种刺激类型进行按键反应，在作出按键时会有按键的正确反馈。

在上面的要求下，我们设计了以下实验：

```

const audioContext = new (window.AudioContext || window.webkitAudioContext)(); // 创建音频上下文对象，兼容不同浏览器
if (audioContext.state === 'suspended') { audioContext.resume(); } // 如果音频上下文处于暂停状态，则恢复它

let jsPsych = initJsPsych({ // 初始化jsPsych实例
    override_safe_mode: true // 设置为覆盖安全模式，允许运行实验
});

// 被试信息填写阶段
let subject_info = {
    type: jsPsychSurveyHtmlForm, // 使用jsPsychSurveyHtmlForm类型定义被试信息填写页面
    preamble: '<h3>请填写以下信息</h3>', // 填写信息前的引导语
    html: `
    <form>
        <p>
            <label for="subject_id">编号:</label>
            <input name="subject_id" type="text" required>
        </p>
        <p>
            <label for="gender">性别:</label>
            <select name="gender" required>
                <option value="" disabled selected>选择性别</option>
                <option value="male">男</option>
                <option value="female">女</option>
                <option value="other">其他</option>
            </select>
        </p>
        <p>
            <label for="age">年龄:</label>
            <input name="age" type="number" min="1" max="120" required>
        </p>
        <p>
            <label for="handedness">左/右利手:</label>
            <select name="handedness" required>
                <option value="" disabled selected>选择利手</option>
                <option value="left">左手</option>
                <option value="right">右手</option>
            </select>
        </p>
        <p>
            <label for="education">学历:</label>
            <select name="education" required>
                <option value="" disabled selected>选择学历</option>
                <option value="primary">小学</option>
                <option value="middle">初中</option>
                <option value="high">高中</option>
                <option value="bachelor">本科</option>
                <option value="master">硕士</option>
                <option value="phd">博士</option>
            </select>
        </p>
    </form>
    `,
};

// 进入全屏设置
let enter_fullscreen = {
    type: jsPsychFullscreen, // 使用jsPsychFullscreen类型定义进入全屏
    fullscreen_mode: true // 设置全屏模式为true
};

// 退出全屏设置
var exit_fullscreen = {
    type: jsPsychFullscreen, // 使用jsPsychFullscreen类型定义退出全屏
    fullscreen_mode: false, // 设置全屏模式为false
    delay_after: 1000 // 设置延迟时间为1000ms
};

// 指导语阶段
let instruction = {
    type: jsPsychHtmlKeyboardResponse, // 使用jsPsychHtmlKeyboardResponse类型定义指导语页面
    stimulus: `
    <div>
        <p class="center-bold">欢迎参加本实验。</p>
        <p>在实验中，屏幕中央会呈现一个词语，该词语表示一种颜色。</p>
        <p>你的任务是忽略词语的含义，尽快按键报告词语的字体颜色。</p>
        <p>如果词语的字体颜色是<span style="color: red;">红色</span>，请按 D 键</p>
        <p>如果词语的字体颜色是<span style="color: green;">绿色</span>，请按 F 键</p>
        <p>如果词语的字体颜色是<span style="color: yellow;">黄色</span>，请按 J 键</p>
        <p>如果词语的字体颜色是<span style="color: blue;">蓝色</span>，请按 K 键</p>
        <p>按任意键开始实验</p>
    </div>
    `,
    post_trial_gap: 500 // 设置指导语后的间隔时间为500ms
};

// 实验中的定位点
let fixation = {
    type: jsPsychHtmlKeyboardResponse, // 使用jsPsychHtmlKeyboardResponse类型定义定位点页面
    stimulus: '<p style="font-size: 36px;">+</p>', // 设置定位点的刺激为一个大号加号
    choices: "NO_KEYS", // 设置无键盘响应
    trial_duration: 500 // 设置试次持续时间为500ms
};

// Stroop实验的试次设置
let stroop_trial = {
    type: jsPsychHtmlKeyboardResponse, // 使用jsPsychHtmlKeyboardResponse类型定义Stroop试次页面
    stimulus: jsPsych.timelineVariable('word'), // 设置刺激为时间线变量中的词语
    choices: ['d', 'f', 'j', 'k'], // 设置可响应键为D、F、J、K
    trial_duration: 1500, // 设置试次持续时间为1500ms
    data: {
        word: jsPsych.timelineVariable('word_text'), // 记录试次数据中的词语文本
        color: jsPsych.timelineVariable('color'), // 记录试次数据中的颜色
        congruency: jsPsych.timelineVariable('congruency'), // 记录试次数据中的一致性
        block: jsPsych.timelineVariable('block') // 记录试次数据中的块号
    },
    on_finish: function(data) { // 完成试次后的操作函数
        let correct = false; // 初始化正确性为假
        if(data.color == 'red' && data.response == 'd'){ // 判断是否正确响应红色词语
            correct = true;
        } else if(data.color == 'green' && data.response == 'f'){ // 判断是否正确响应绿色词语
            correct = true;
        } else if(data.color == 'yellow' && data.response == 'j'){ // 判断是否正确响应黄色词语
            correct = true;
        } else if(data.color == 'blue' && data.response == 'k'){ // 判断是否正确响应蓝色词语
            correct = true;
        }
        data.correct = correct; // 将正确性记录添加到试次数据中
    },
};

// 反馈信息设置
let feedback = {
    type: jsPsychHtmlKeyboardResponse, // 使用jsPsychHtmlKeyboardResponse类型定义反馈页面
    stimulus: function() { // 设置反馈刺激的函数
        let last_trial_correct = jsPsych.data.get().last(1).values()[0].correct; // 获取上一个试次的正确性
        if(last_trial_correct){ // 如果上一个试次正确
            return '<p style="

```



------

## 3.CSS文件（default.css）

为了使整个实验变得美观，需要在css文件中设定我们所需的内容

```css
/* 设置整体页面样式 */
body {
    background-color: black; /* 设置页面背景为黑色 */
    color: white; /* 设置文字颜色为白色 */
    font-family: Arial, sans-serif; /* 设置字体为Arial或sans-serif */

    /* 下面是针对特定元素的样式设置 */
}

/* 居中标题和加粗段落 */
h3, p.center-bold {
    text-align: center; /* 将标题和加粗段落居中对齐 */
}

/* 表单元素样式设置 */
input, select {
    width: 100%; /* 设置输入框和下拉框宽度为100% */
    box-sizing: border-box; /* 设置盒模型为border-box，保证宽度包括内边距和边框 */
}

/* 表单段落样式设置 */
form p {
    display: flex; /* 使用Flex布局 */
    justify-content: space-between; /* 段落内元素左右对齐 */
    align-items: center; /* 段落内元素垂直居中对齐 */
    margin-bottom: 10px; /* 底部外边距为10px */
}

/* 表单标签样式设置 */
form p label {
    flex: 1; /* 设置标签元素占据Flex容器的比例 */
    text-align: left; /* 标签文本左对齐 */
}

/* 表单输入框和下拉框样式设置 */
form p input, form p select {
    flex: 2; /* 设置输入框和下拉框元素占据Flex容器的比例 */
}

/* 主容器样式设置 */
#main-container {
    display: flex; /* 使用Flex布局 */
    justify-content: center; /* 主容器内元素水平居中对齐 */
    align-items: center; /* 主容器内元素垂直居中对齐 */
    height: 100vh; /* 设置主容器高度为视窗高度 */
    text-align: left; /* 主容器内文本左对齐 */
}

```

最后，我们完成了本实验所有的操作。
