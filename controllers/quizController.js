const Quiz = require('../models/quiz');
const { body,validationResult } = require('express-validator');
//const { sanitizeBody } = require('express-validator/filter');
const async = require('async');

//display home page
exports.index = function(req, res) {
    res.render('index', {title: 'Home', current_page: "Home" });
}

//display detail page for a specific category
exports.category_detail = function(req, res, next) {
    Quiz.find({ "category": req.params.id })
    .exec(function (err, quiz_list) {
        if (err) { return next(err); }
        //successful, so render
        res.render('quiz_list', { title: req.params.id, quiz_list: quiz_list, current_page: "Categories" });
    });
};

//display quizzes after search
exports.quiz_search = function(req, res, next) {
    let searchName = new RegExp(req.params.name, 'i');
    Quiz.find({ "name": searchName })
    .exec(function (err, quiz_list) {
        if (err) { return next(err); }
        //successful, so render
        res.render('quiz_search', { title: "Quiz Search", quiz_list: quiz_list });
    });
}

//display start page for a specific quiz
exports.quiz_start = function(req, res, next) {
    Quiz.findById(req.params.id)
    .exec(function (err, quiz) {
        if (err) { return next(err); }
        if (quiz==null) { //no results
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        //successful, so render
        res.render('quiz', { title: quiz.name, quiz: quiz, current_page: "Categories" });
    });
};

//handle request to like quiz on POST
exports.quiz_like = [

    //get quiz details from current quiz so they're not overwritten
    (req, res, next) => {
        Quiz.findById(req.params.id)
        .exec(function (err, found_quiz) {
            if (err) { return next(err); }
            req.body.questions = found_quiz.questions;
            req.body.answers = found_quiz.answers;
            req.body.correct_answers = found_quiz.correct_answers;
            req.body.hints = found_quiz.hints;
            req.body.likes = found_quiz.likes + 1;
            req.body.name = found_quiz.name;
            req.body.description = found_quiz.description;
            req.body.difficulty = found_quiz.difficulty;
            req.body.category = found_quiz.category;
            req.body.author = found_quiz.author;
            req.body.date_created = found_quiz.date_created;
            next();
        });
    },

    //process request after validation and sanitization
    (req, res, next) => {

        //extract the validation errors from a request
        const errors = validationResult(req);

        //create a new Quiz object
        const quiz = new Quiz(
            {
                questions: req.body.questions,
                answers: req.body.answers,
                correct_answers: req.body.correct_answers,
                hints: req.body.hints,
                likes: req.body.likes,
                name: req.body.name,
                category: req.body.category,
                difficulty: req.body.difficulty,
                description: req.body.description,
                author: req.body.author,
                date_created: req.body.date_created,
                _id: req.params.id
            }
        );
        //data from form is valid. update record
        Quiz.findByIdAndUpdate(req.params.id, quiz, {}, function (err, thequiz) {
            if (err) { return next(err); }
            //successful - redirect to new quiz page
            res.status(204).end();
        });
        
    }
];

//display Quiz create form on GET
exports.quiz_create_get = function(req, res, next) {
    res.render('quiz_details_form', { title: 'Quiz Details', page: 'Create', current_page: "Create Quiz" });
};

//handle Quiz create on POST
exports.quiz_create_post = [
    //validate and sanitize fields
    body('name', 'Quiz Name must be specified no more than 100 characters').trim().isLength({ min: 1, max: 100 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('category', 'Quiz Category must be selected').trim().isLength({ min: 1 }).escape(),
    body('difficulty', 'Quiz Difficulty must be selected').trim().isLength({ min: 1 }).escape(),
    body('description', 'Quiz Description must be specified and no more than 200 characters').isLength({ min: 1, max: 200 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('author', 'Quiz Author must be specified and no more than 30 characters').trim().isLength({ min: 1, max: 100 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),

    //process request after validation and sanitization
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            //there are errors, render form again
            res.render('quiz_details_form', { title: 'Create Quiz', quiz: req.body, current_page: "Create Quiz", errors: errors.array() });
            return;
        } else {
            //data from form is valid
            //create a quiz object with escaped and trimmed data
            
            const quiz = new Quiz(
                {
                    name: req.body.name,
                    category: req.body.category,
                    difficulty: req.body.difficulty,
                    description: req.body.description,
                    author: req.body.author
                }
            );
            quiz.save(function (err) {
                if (err) { return next(err); }
                //successful - redirect to new quiz page
                res.redirect(quiz.details_url);
            });
        }
    }
];

//display quiz delete from on GET
exports.quiz_delete_get = function(req, res, next) {
    Quiz.findById(req.params.id)
    .exec(function (err, quiz) {
        if (err) { return next(err); }
        if (quiz==null) { //no results
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        //successful, so render
        res.render('quiz_delete', { title: 'Delete Quiz', quiz: quiz, current_page: "Create Quiz" });
    });
};

//handle quiz delete on POST
exports.quiz_delete_post = function(req, res, next) {
    Quiz.findByIdAndRemove(req.params.id, function deleteQuiz(err) {
        if (err) { return next(err); }
        //successful - redirect to new quiz page
        res.redirect("/");
    });
};

//display Quiz details on GET
exports.quiz_details_get = function(req, res, next) {
    Quiz.findById(req.params.id)
    .exec(function (err, quiz) {
        if (err) { return next(err); }
        if (quiz==null) { //no results
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        //successful, so render
        res.render('quiz_details', { title: quiz.name, quiz: quiz, current_page: "Create Quiz" });
    });
};

//display quiz details update form on GET
exports.quiz_details_update_get = function(req, res, next) {
    Quiz.findById(req.params.id)
    .exec(function (err, quiz) {
        if (err) { return next(err); }
        if (quiz==null) { //no results
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        //successful, so render
        res.render('quiz_details_form', { title: quiz.name, quiz: quiz, quiz_name: quiz.name, quiz_author: quiz.author, page: 'Update', current_page: "Create Quiz" });
    });
};

//handle Quiz details update on POST
exports.quiz_details_update_post = [
    //validate and sanitize fields
    body('name', 'Quiz Name must be specified no more than 100 characters').trim().isLength({ min: 1, max: 100 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('category', 'Quiz Category must be selected').trim().isLength({ min: 1 }).escape(),
    body('difficulty', 'Quiz Difficulty must be selected').trim().isLength({ min: 1 }).escape(),
    body('description', 'Quiz Description must be specified and no more than 200 characters').isLength({ min: 1, max: 200 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('author', 'Quiz Author must be specified and no more than 30 characters').trim().isLength({ min: 1, max: 100 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),

    //get questions/answers from current quiz so they're not overwritten
    (req, res, next) => {
        Quiz.findById(req.params.id)
        .exec(function (err, found_quiz) {
            if (err) { return next(err); }
            req.body.questions = found_quiz.questions;
            req.body.answers = found_quiz.answers;
            req.body.correct_answers = found_quiz.correct_answers;
            req.body.hints = found_quiz.hints;
            req.body.likes = found_quiz.likes;
            next();
        });
    },

    //process request after validation and sanitization
    (req, res, next) => {

        //extract the validation errors from a request
        const errors = validationResult(req);

        //create a new Quiz object with sanitized data
        const quiz = new Quiz(
            {
                questions: req.body.questions,
                answers: req.body.answers,
                correct_answers: req.body.correct_answers,
                hints: req.body.hints,
                likes: req.body.likes,
                name: req.body.name,
                category: req.body.category,
                difficulty: req.body.difficulty,
                description: req.body.description,
                author: req.body.author,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            //there are errors, render form again
            res.render('quiz_details_form', { title: 'Update Quiz', quiz: req.body, quiz_name: req.body.name, current_page: "Create Quiz", errors: errors.array() });
            return;
        } else {
            //data from form is valid. update record
            Quiz.findByIdAndUpdate(req.params.id, quiz, {}, function (err, thequiz) {
                if (err) { return next(err); }
                //successful - redirect to new quiz page
                res.redirect(thequiz.details_url);
            });
        }
    }
];

//display quiz edit question form on GET
exports.quiz_details_editquestion_get = function(req, res, next) {
    Quiz.findById(req.params.id)
    .exec(function (err, quiz) {
        if (err) { return next(err); }
        if (quiz==null) { //no results
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        //successful, so render
        res.render('quiz_question_form', { title: 'Edit Question', quiz: quiz, quiz_name: quiz.name, quiz_author: quiz.author, question_number: req.params.num, page: 'Update', current_page: "Create Quiz" });
    });
};

//handle Quiz details update on POST
exports.quiz_details_editquestion_post = [
    //validate and sanitize fields
    body('question', 'Question must be specified and under 150 characters').trim().isLength({ min: 1, max: 150 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer1', 'Answer 1 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer2', 'Answer 2 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer3', 'Answer 3 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer4', 'Answer 4 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).escape(),
    body('correct_answer', 'Correct Answer must be specified').trim().isLength({ min: 1 }).toInt().escape(),
    body('hint', 'Hint must be under 100 characters').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),

    //get quiz details from current quiz so they're not overwritten
    (req, res, next) => {
        Quiz.findById(req.params.id)
        .exec(function (err, found_quiz) {
            if (err) { return next(err); }
            req.body.questions = found_quiz.questions;
            req.body.questions[req.params.num] = req.body.question;
            req.body.answers = found_quiz.answers;
            req.body.answers[req.params.num] = [req.body.answer1, req.body.answer2, req.body.answer3, req.body.answer4];
            req.body.correct_answers = found_quiz.correct_answers;
            req.body.correct_answers[req.params.num] = [req.body.answer1, req.body.answer2, req.body.answer3, req.body.answer4][Number(req.body.correct_answer) - 1];
            req.body.hints = found_quiz.hints;
            req.body.hints[req.params.num] = req.body.hint;
            req.body.likes = found_quiz.likes;
            req.body.name = found_quiz.name;
            req.body.description = found_quiz.description;
            req.body.difficulty = found_quiz.difficulty;
            req.body.category = found_quiz.category;
            req.body.author = found_quiz.author;
            next();
        });
    },

    //process request after validation and sanitization
    (req, res, next) => {

        //extract the validation errors from a request
        const errors = validationResult(req);

        //create a new Quiz object with sanitized data
        const quiz = new Quiz(
            {
                questions: req.body.questions,
                answers: req.body.answers,
                correct_answers: req.body.correct_answers,
                hints: req.body.hints,
                likes: req.body.likes,
                name: req.body.name,
                category: req.body.category,
                difficulty: req.body.difficulty,
                description: req.body.description,
                author: req.body.author,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            //there are errors, render form again
            res.render('quiz_question_form', { title: 'Edit Question', quiz: req.body, quiz_name: req.body.name, quiz_author: req.body.author, errors: errors.array(), current_page: "Create Quiz" });
            return;
        } else {
            //data from form is valid. update record
            Quiz.findByIdAndUpdate(req.params.id, quiz, {}, function (err, thequiz) {
                if (err) { return next(err); }
                //successful - redirect to new quiz page
                res.redirect(thequiz.details_url);
            });
        }
    }
];

//display quiz add question form on GET
exports.quiz_details_addquestion_get = function(req, res, next) {
    Quiz.findById(req.params.id)
    .exec(function (err, quiz) {
        if (err) { return next(err); }
        if (quiz==null) { //no results
            const err = new Error('Quiz not found');
            err.status = 404;
            return next(err);
        }
        //successful, so render
        res.render('quiz_question_form', { title: 'Add Question', quiz_name: quiz.name, quiz_author: quiz.author, page: 'Create', current_page: "Create Quiz" });
    });
};

//handle Quiz details update on POST
exports.quiz_details_addquestion_post = [
    //validate and sanitize fields
    body('question', 'Question must be specified and under 150 characters').trim().isLength({ min: 1, max: 150 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer1', 'Answer 1 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer2', 'Answer 2 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer3', 'Answer 3 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),
    body('answer4', 'Answer 4 must be specified and under 50 characters').trim().isLength({ min: 1, max: 50 }).escape(),
    body('correct_answer', 'Correct Answer must be specified').trim().isLength({ min: 1 }).toInt().escape(),
    body('hint', 'Hint must be under 100 characters').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 100 }).whitelist(["\\\w", "\\\s", ".", "'", ",", '"', "?", "!", "-", "(", ")"]),

    //get quiz details from current quiz so they're not overwritten
    (req, res, next) => {
        Quiz.findById(req.params.id)
        .exec(function (err, found_quiz) {
            if (err) { return next(err); }
            console.log(req.body);
            req.body.questions = found_quiz.questions;
            req.body.questions.push(req.body.question);
            req.body.answers = found_quiz.answers;
            req.body.answers.push([req.body.answer1, req.body.answer2, req.body.answer3, req.body.answer4]);
            req.body.correct_answers = found_quiz.correct_answers;
            req.body.correct_answers.push([req.body.answer1, req.body.answer2, req.body.answer3, req.body.answer4][Number(req.body.correct_answer) - 1]);
            req.body.hints = found_quiz.hints;
            req.body.hints.push(req.body.hint);
            req.body.likes = found_quiz.likes;
            req.body.name = found_quiz.name;
            req.body.description = found_quiz.description;
            req.body.difficulty = found_quiz.difficulty;
            req.body.category = found_quiz.category;
            req.body.author = found_quiz.author;
            next();
        });
    },

    //process request after validation and sanitization
    (req, res, next) => {

        //extract the validation errors from a request
        const errors = validationResult(req);

        //create a new Quiz object with sanitized data
        const quiz = new Quiz(
            {
                questions: req.body.questions,
                answers: req.body.answers,
                correct_answers: req.body.correct_answers,
                hints: req.body.hints,
                likes: req.body.likes,
                name: req.body.name,
                category: req.body.category,
                difficulty: req.body.difficulty,
                description: req.body.description,
                author: req.body.author,
                _id: req.params.id
            }
        );

        if (!errors.isEmpty()) {
            //there are errors, render form again
            res.render('quiz_question_form', { title: 'Add Question', quiz: req.body, quiz_name: req.body.name, quiz_author: req.body.author, errors: errors.array(), current_page: "Create Quiz" });
            return;
        } else {
            //data from form is valid. update record
            Quiz.findByIdAndUpdate(req.params.id, quiz, {}, function (err, thequiz) {
                if (err) { return next(err); }
                //successful - redirect to new quiz page
                res.redirect(thequiz.details_url);
            });
        }
    }
];