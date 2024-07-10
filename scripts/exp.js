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
  }

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

let stroop_timeline = {
    timeline: [fixation, stroop_trial, feedback],
    timeline_variables: createTimelineVariables(current_block),
    sample: {
        type: 'fixed-repetitions',
        size: 1
    },
    randomize_order: true
};

// 实验结束后统计正确率并显示相应的结束语
let debrief = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        let current_block_data = jsPsych.data.get().filter({block: current_block});
        let correct_trials = current_block_data.filter({correct: true}).count();
        let total_trials = current_block_data.count();
        let accuracy = correct_trials / total_trials;

        let debrief_message = '<p>本轮实验结束，您的正确率是 ' + (accuracy * 100).toFixed(2) + '%。</p>';
        if (accuracy >= 0.8) {
            debrief_message += '<p>谢谢您的参与，请联系主试，并按“ESC”键退出。</p>';
        } else {
            debrief_message += '<p>您的正确率不足80%，可能要认真点奥，请按任意键再次测验。</p>';
        }

        return debrief_message;
    },
    on_finish: function(data) {
        let current_block_data = jsPsych.data.get().filter({block: current_block});
        let correct_trials = current_block_data.filter({correct: true}).count();
        let total_trials = current_block_data.count();
        let accuracy = correct_trials / total_trials;

        if (accuracy < 0.8) {
            current_block++;
            jsPsych.addNodeToEndOfTimeline(instruction);
            jsPsych.addNodeToEndOfTimeline({
                timeline: [fixation, stroop_trial, feedback],
                timeline_variables: createTimelineVariables(current_block),
                sample: {
                    type: 'fixed-repetitions',
                    size: 1
                },
                randomize_order: true
            });
            jsPsych.addNodeToEndOfTimeline(debrief);
        }
    }
};

// 运行实验
jsPsych.run([
    subject_info,
    enter_fullscreen,
    instruction,
    stroop_timeline,
    debrief
]);
