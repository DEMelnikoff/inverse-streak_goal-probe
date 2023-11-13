var exp = (function() {

    let p = {};

    // randomly assign to conditions and save settings
    const colorOrder = Math.floor(Math.random() * 2);

    const settings = {
        pM: [.2, .8][Math.floor(Math.random()*2)],
        pM_practice: .5,
        gameType: [['bern', '1inN'], ['1inN', 'bern']][Math.floor(Math.random()*2)],
        nTrials: 50,
        basePay: 3.00,
        roundLength: 3,
        hex_1: ['#00aa00', '#1067e8'][colorOrder],
        hex_2: ['#00aa00', '#1067e8'][1 - colorOrder],
        gameName_1: ['<span style="color: #00aa00; font-weight: bold">Green Game</span>', '<span style="color: #1067e8; font-weight: bold">Blue Game</span>'][colorOrder],
        gameName_2: ['<span style="color: #00aa00; font-weight: bold">Green Game</span>', '<span style="color: #1067e8; font-weight: bold">Blue Game</span>'][1 - colorOrder],
        color_1: ['<span style="color: #00aa00; font-weight: bold">green</span>', '<span style="color: #1067e8; font-weight: bold">blue</span>'][colorOrder],
        color_2: ['<span style="color: #00aa00; font-weight: bold">green</span>', '<span style="color: #1067e8; font-weight: bold">blue</span>'][1 - colorOrder],
    };

    console.log(settings.gameType, settings.pM)
    settings.tileHit_1 = `<div class="outcome-container">
                            <div class="header">{header}</div>
                            <div class="box" style="background-color:${settings.hex_1}"></div>
                        </div>`;

    settings.tileHit_2 = `<div class="outcome-container">
                            <div class="header">{header}</div>
                            <div class="box" style="background-color:${settings.hex_2}"></div>
                        </div>`;

    settings.tileMiss = `<div class="outcome-container">
                            <div class="header">{header}</div>
                            <div class="box" style="background-color:white"></div>
                        </div>`;

    // save condition and URL data
    jsPsych.data.addProperties({
        pM: settings.pM,
        gameType_1: settings.gameType[0],
        gameType_2: settings.gameType[1],
        basePay: settings.basePay,
        startTime: String(new Date()),
    });

   /*
    *
    *   INSTRUCTIONS
    *
    */

    // constructor function for presenting post-practice tile game information and assessing comprehension
    function MakeTaskInstructions(gameType, gameName_1, gameName_2, color, hex, roundLength, pM, round) {

        const gameName = (round == 1) ? gameName_1 : gameName_2;

        const howToEarn = {
            type: jsPsychInstructions,
            pages: dmPsych.tileGame_howToEarn(gameType, gameName_1, gameName_2, pM, color, hex, roundLength, round),
            show_clickable_nav: true,
        };

        let a1, a2, a3;

        if (gameType == 'invStrk') {
            // attention check #1
            a1 = 'Activate the tile in as few attempts as possible';
            a2 = 'You will receive 10 tokens, increasing your odds of winning a $100.00 bonus prize.';
        };

        if (gameType == 'strk') {
            // attention check #1
            a1 = 'Activate each and every tile.';
            a2 = 'You will receive 10 tokens, increasing your odds of winning a $100.00 bonus prize.';
            a3 = (pM == .5) ? '50% of their rounds.' : '15% of their rounds.';
        };

        if (gameType == '1inN') {
            // attention check #1
            a1 = 'Activate a tile before my four chances are up.';
            a2 = 'You will receive 10 tokens, increasing your odds of winning a $100.00 bonus prize.';
            a3 = (pM == .5) ? '90% of their rounds.' : '50% of their rounds.';
        };

        if (gameType == 'bern') {
            // attention check #1
            a1 = 'Activate each and every tile.';
            a2 = 'You will receive 10 tokens, increasing your odds of winning a $100.00 bonus prize.';
            a3 = (pM == .5) ? '50% of their rounds.' : '15% of their rounds.';
        };

        const compChk = {
            type: jsPsychSurveyMultiChoice,
            preamble: `<div style="font-size:16px"><p>To make sure you understand the ${gameName}, please answer the following questions:</p></div>`,
            questions: [
                {
                  prompt: `What is the goal of the ${gameName}?`, 
                  name: 'attnChk1', 
                  options: ['Activate each and every tile.', 'Activate a tile before my four chances are up.'], 
                  required: true
                },
                {
                  prompt: `Each time you win a round...`, 
                  name: 'attnChk2', 
                  options: ['You will receive 10 tokens, increasing your odds of winning a $100.00 bonus prize.', 'You will receive bonus points.', 'You will receive $1.00.'],
                  required: true
                },
                {
                  prompt: `In the ${gameName}, players generally win...`, 
                  name: 'attnChk3', 
                  options: ['15% of their rounds.', '50% of their rounds.', '90% of their rounds.'], 
                  required: true
                },
            ],
            on_finish: (data) => {
                const correctAnswers = [a1, a2, a3];
                const totalErrors = dmPsych.getTotalErrors(data, correctAnswers);
                data.totalErrors = totalErrors;
            }
        };

        const errorMessage = {
            type: jsPsychInstructions,
            pages: [`<div class='parent'><p>You provided a wrong answer.<br>To make sure you understand the game, please continue to re-read the instructions.</p></div>`],
            show_clickable_nav: true,
        };

        const conditionalNode = {
            timeline: [errorMessage],
            conditional_function: () => {
                const fail = jsPsych.data.get().last(1).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            }
        };

        const attnChkLoop = { 
            timeline: [howToEarn, compChk, conditionalNode],
            loop_function: () => {
                const fail = jsPsych.data.get().last(2).select('totalErrors').sum() > 0 ? true : false;
                return fail;
            },
        };

        const getReady = {
            type: jsPsychInstructions,
            pages: [`<div class='parent'><p>You're now ready to play the ${gameName}.</p><p>Proceed to begin.</p></div>`],
            show_clickable_nav: true,
        };

        this.timeline = [attnChkLoop, getReady];
    };


    // create instruction nodes

    p.consent = {
        type: jsPsychInstructions,
        pages: dmPsych.consentForm(settings),
        show_clickable_nav: true,
    };

    p.intro = {
        type: jsPsychInstructions,
        pages: [`<div class='parent' style='text-align: left'>
                    <p>We are designing games that scientists can use to study visual attention. 
                    Our goal is to make the games as immersive and engaging as possible.
                    To make the games as immersive and engaging as possible, we are getting feedback from people like you.</p>
                    <p>You will play two different games: the ${settings.gameName_1} and the ${settings.gameName_2}. 
                    After each game, you will report how immersed and engaged you felt.</p>
                    <p>The games are very similar, but their color schemes will help you tell them apart.</p>
                </div>`,

                `<div class='parent' style='text-align: left'>
                    <p>During both games, you'll be competing for a chance to win a <b>$100.00 bonus prize</b>.</p>
                    <p>Specifically, during both the ${settings.gameName_1} and the ${settings.gameName_2}, you'll earn tokens. The tokens you earn will be entered into a lottery, and if one of your tokens is drawn, you'll win $100.00. To maximize your chances of winning a $100.00 bonus, you'll need to earn as many tokens as possible.</p>
                    <p>Continue to learn about and play the ${settings.gameName_1}. After you finish, you'll learn about and play the ${settings.gameName_2}.</p>
                </div>`],
        show_clickable_nav: true,
        post_trial_gap: 500,
    };

    p.round1_howToPlay = {
        type: jsPsychInstructions,
        pages: dmPsych.tileGame_howToPlay(settings.gameType[0], settings.gameName_1, settings.color_1, settings.hex_1, settings.roundLength),
        show_clickable_nav: true,
    };

    p.round1_howToEarn = new MakeTaskInstructions(settings.gameType[0], settings.gameName_1, settings.gameName_2, settings.color_1, settings.hex_1, settings.roundLength, settings.pM, 1);

    p.round1_complete = {
        type: jsPsychInstructions,
        pages: dmPsych.tileGame_round1Complete(settings.gameName_1, settings.gameName_2),
        show_clickable_nav: true,
    };

    p.round2_howToEarn = new MakeTaskInstructions(settings.gameType[1], settings.gameName_1, settings.gameName_2, settings.color_2, settings.hex_2, settings.roundLength, settings.pM, 2);


   /*
    *
    *   TASK
    *
    */

    p.practice1 = new dmPsych.MakeTileGame(settings.hex_1, settings.tileHit_1, settings.tileMiss, settings.roundLength, settings.gameType[0], 10, settings.pM_practice, 'practice', 0);

    p.round1 = new dmPsych.MakeTileGame(settings.hex_1, settings.tileHit_1, settings.tileMiss, settings.roundLength, settings.gameType[0], settings.nTrials, settings.pM, 'tileGame', 1);

    p.round2 = new dmPsych.MakeTileGame(settings.hex_2, settings.tileHit_2, settings.tileMiss, settings.roundLength, settings.gameType[1], settings.nTrials, settings.pM, 'tileGame', 2);

   /*
    *
    *   QUESTIONS
    *
    */

    // scales
    const zeroToExtremely = ["0<br>A little", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>Extremely"];
    const zeroToALot = ['0<br>A little', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10<br>A lot'];

    // constructor functions


    var enjoyQs = function(name, round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px'>

        <p>Thank you for completing the ${name}!</p>

        <p>How much did you enjoy the ${name}?<br>
        Report the degree to which you enjoyed the ${name} by answering the following questions.</p></div>`;
        this.questions = [
            {prompt: `How much did you <strong>enjoy</strong> playing the ${name}?`,
            name: `enjoyable`,
            labels: zeroToALot},
            {prompt: `How much did you <strong>like</strong> playing the ${name}?`,
            name: `like`,
            labels: zeroToALot},
            {prompt: `How much did you <strong>dislike</strong> playing the ${name}?`,
            name: `dislike`,
            labels: zeroToALot},
            {prompt: `How much <strong>fun</strong> did you have playing the ${name}?`,
            name: `fun`,
            labels: zeroToALot},
            {prompt: `How <strong>entertaining</strong> was the ${name}?`,
            name: `entertaining`,
            labels: zeroToExtremely},
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish = (data) => {
            dmPsych.saveSurveyData(data);
        };
    };

    const flowQs = function(name, round) {
        this.type = jsPsychSurveyLikert;
        this.preamble = `<div style='padding-top: 50px; width: 850px; font-size:16px'>

        <p>Below are a few more questions about the ${name}.</p>

        <p>These questions are <b>not</b> about enjoyment. Instead, they ask how <b>immersed and engeged</b> you were.</p>
        During the ${name}, were you so "in the zone" and "locked in" that you lost yourself in what you were doing?<br>
        Or were you bored, frustrated, or otherwise distracted?</p>

        <p>Report how immersed and engaged you were by answering the following questions.</p></div>`;
        this.questions = [
            {prompt: `During the ${name}, how <strong>absorbed</strong> did you feel in what you were doing?`,
            name: `absorbed`,
            labels: ["0<br>Not very absorbed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More absorbed than I've ever felt"]},
            {prompt: `During the ${name}, how <strong>immersed</strong> did you feel in what you were doing?`,
            name: `immersed`,
            labels: ["0<br>Not very immersed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More immersed than I've ever felt"]},
            {prompt: `During the ${name}, how <strong>engaged</strong> did you feel in what you were doing?`,
            name: `engaged`,
            labels: ["0<br>Not very engaged", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engaged than I've ever felt"]},
            {prompt: `During the ${name}, how <strong>engrossed</strong> did you feel in what you were doing?`,
            name: `engrossed`,
            labels: ["0<br>Not very engrossed", '1', '2', '3', '4', '5', '6', '7', '8', '9', "10<br>More engrossed than I've ever felt"]},
            {prompt: `How much of your <b>conscious focus and attention</b> did the ${name} manage to capture?`,
            name: `attention`,
            labels: ["0%<br>None of it", '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', "100%<br>All of it"]},
        ];
        this.randomize_question_order = false;
        this.scale_width = 700;
        this.data = {round: round};
        this.on_finish =(data) => {
            dmPsych.saveSurveyData(data);
        };
    };
    
    p.round1_Qs = {
        timeline: [new enjoyQs(settings.gameName_1, 1), new flowQs(settings.gameName_1, 1)]
    };

    p.round2_Qs = {
        timeline: [new enjoyQs(settings.gameName_2, 2), new flowQs(settings.gameName_2, 2)]
    };

    p.demographics = (function() {

        const goalProbe = {
            type: jsPsychSurveyMultiChoice,
            questions: [
                {
                    prompt: `<div style="width:850px"><p>When playing the Tile Game, different people think about their task in different ways.
                    For example, some people might trying to win as many rounds as possible. 
                    Other people might try to build "streaks" by activating as many tiles in a row as possible.
                    These are just some of the ways people might think about their task.</p>
                    <p><strong>Consider how you were thinking about your task. Which of the following statements best describes how you were thinking about your task during the Tile Game?</strong></p></div>`,
                    name: `goalRep`,
                    options: [`For each round, I was trying to activate a tile before my four chances were up.`, `I was trying to build streaks by activing as many tiles in a row as possible.`, `I was trying to activate every single tile I saw.`],
                    required: true,
                    horizontal: false,
                }],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data);
            }
        };

        const demosIntro = {
            type: jsPsychInstructions,
            pages: [
                `<div class='parent'>
                    <p>Thank you for playing and evaluating our games!</p>
                    <p>Next, you will finish the study by answering a few final questions.</p>
                </div>`
            ],
            show_clickable_nav: true,
        };

        const gender = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>What is your gender?</p>',
            choices: ['Male', 'Female', 'Other'],
            on_finish: (data) => {
                data.gender = data.response;
            }
        };

        const age = {
            type: jsPsychSurveyText,
            questions: [{prompt: "Age:", name: "age"}],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 

        const ethnicity = {
            type: jsPsychSurveyHtmlForm,
            preamble: '<p>What is your race / ethnicity?</p>',
            html: `<div style="text-align: left">
            <p>White / Caucasian <input name="ethnicity" type="radio" value="white"/></p>
            <p>Black / African American <input name="ethnicity" type="radio" value="black"/></p>
            <p>East Asian (e.g., Chinese, Korean, Vietnamese, etc.) <input name="ethnicity" type="radio" value="east-asian"/></p>
            <p>South Asian (e.g., Indian, Pakistani, Sri Lankan, etc.) <input name="ethnicity" type="radio" value="south-asian"/></p>
            <p>Latino / Hispanic <input name="ethnicity" type="radio" value="hispanic"/></p>
            <p>Middle Eastern / North African <input name="ethnicity" type="radio" value="middle-eastern"/></p>
            <p>Indigenous / First Nations <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Bi-racial <input name="ethnicity" type="radio" value="indigenous"/></p>
            <p>Other <input name="other" type="text"/></p>
            </div>`,
            on_finish: (data) => {
                data.ethnicity = data.response.ethnicity;
                data.other = data.response.other;
            }
        };

        const english = {
            type: jsPsychHtmlButtonResponse,
            stimulus: '<p>Is English your native language?:</p>',
            choices: ['Yes', 'No'],
            on_finish: (data) => {
                data.english = data.response;
            }
        };  

        const finalWord = {
            type: jsPsychSurveyText,
            questions: [{prompt: "Questions? Comments? Complains? Provide your feedback here!", rows: 10, columns: 100, name: "finalWord"}],
            on_finish: (data) => {
                dmPsych.saveSurveyData(data); 
            },
        }; 


        const demos = {
            timeline: [demosIntro, gender, age, ethnicity, english, finalWord]
        };

        return demos;

    }());

   /*
    *
    *  END TASK
    *
    */


    p.save_data = {
        type: jsPsychPipe,
        action: "save",
        experiment_id: "5gj8ihblbO0L",
        filename: dmPsych.filename,
        data_string: ()=>jsPsych.data.get().csv()
    };

    return p;

}());

const timeline = [exp.consent, exp.intro, 
    exp.round1_howToPlay, exp.practice1, exp.round1_howToEarn, exp.round1, exp.round1_Qs, exp.round1_complete, 
    exp.round2_howToEarn, exp.round2, exp.round2_Qs, exp.demographics, exp.save_data];

// initiate timeline
jsPsych.run(timeline);
