const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const QuizSchema = new Schema(
    {
        name: {type: String, required: true, maxlength: 100, unique: true},
        questions: {type: Array},
        answers: {type: Array},
        correct_answers: {type: Array},
        hints: {type: Array},
        category: {type: String, required: true, enum: ['Animals', 'Art', 'Dating', 'Fun', 'Geography', 'History', 'Language', 'Literature', 'Movies', 'Music', 'Other', 'Religion', 'Science', 'Sports', 'Technology']},
        difficulty: {type: String, required: true, enum: ['Easy', 'Moderate', 'Hard'], default: 'Moderate'},
        description: {type: String, required: true, maxlength: 200},
        date_created: {type: Date, default: Date.now},
        likes: {type: Number, default: 0},
        author: {type: String, require: true, maxlength: 30}
    }
);

QuizSchema.virtual('start_url').get(function () {
    return '/content/quiz/' + this._id + '/start';
});

QuizSchema.virtual('details_url').get(function () {
    return '/content/quiz/' + this._id + '/details';
})

QuizSchema.virtual('date_created_formatted').get(function () {
    return moment(this.date_created).format('MM/DD/YYYY');
});

QuizSchema.virtual('number_of_questions').get(function () {
    return this.questions.length;
});

module.exports = mongoose.model('Quiz', QuizSchema);