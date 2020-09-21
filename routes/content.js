const express = require('express');
const router = express.Router();

const quiz_controller = require('../controllers/quizController');

//GET content home page
router.get('/', quiz_controller.index);

//GET request for one category
router.get('/category/:id', quiz_controller.category_detail);

//GET request for creating a quiz
router.get('/quiz/create', quiz_controller.quiz_create_get);

//POST request for creating a quiz
router.post('/quiz/create', quiz_controller.quiz_create_post);

//GET request to delete quiz
router.get('/quiz/:id/details/delete', quiz_controller.quiz_delete_get);

//POST request to delete quiz
router.post('/quiz/:id/details/delete', quiz_controller.quiz_delete_post);

//GET request for quiz details
router.get('/quiz/:id/details', quiz_controller.quiz_details_get);

//GET request to update quiz details
router.get('/quiz/:id/details/update', quiz_controller.quiz_details_update_get);

//POST request to update quiz details
router.post('/quiz/:id/details/update', quiz_controller.quiz_details_update_post);

//GET request to edit a quiz question
router.get('/quiz/:id/details/editquestion/:num', quiz_controller.quiz_details_editquestion_get);

//POST request to edit a quiz question
router.post('/quiz/:id/details/editquestion/:num', quiz_controller.quiz_details_editquestion_post);

//GET request to add a new quiz question
router.get('/quiz/:id/details/addquestion', quiz_controller.quiz_details_addquestion_get);

//POST request to add a new quiz question
router.post('/quiz/:id/details/addquestion', quiz_controller.quiz_details_addquestion_post);

//GET request to start a specific quiz
router.get('/quiz/:id/start', quiz_controller.quiz_start);

//POST request to like a quiz upon completeion
router.post('/quiz/:id/start', quiz_controller.quiz_like);

//GET request to search for a quiz by name
router.get('/quiz/search/:name', quiz_controller.quiz_search);

module.exports = router;