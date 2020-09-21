let answerGiven = false;
let completedQuestions = 0;
let gameOver = false;
let score = 0;

$(document).ready(() => {

  //reveal first question
  $('.quiz-container').first().show();

  //handle hint button click
  $('.hint-button').on('click', (event) => {
    $(event.currentTarget).siblings('.hint').slideToggle();
    if ($(event.currentTarget).html() === 'Give Me a Hint') {
      $(event.currentTarget).html('Hide Hint');
    } else {
      $(event.currentTarget).html('Give Me a Hint');
    }
  })

  //handle mouseenter/leave on answers
  $('.answer').on('mouseenter', (event) => {
    if (!answerGiven) {
      $(event.currentTarget).addClass('targeted');
    }
  }).on('mouseleave', (event) => {
    $(event.currentTarget).removeClass('targeted');
  })

  //handle answer selection
  $('.answer').on('click', (event) => {
    //if an answer was already selected, do not allow another selection
    if (answerGiven) {
      return;
    }
    if ($(event.currentTarget).hasClass('correct-answer')) {
      //answer is correct
      $(event.currentTarget).addClass('correct');
      $(event.currentTarget).next('.correct-response').slideDown();
      score++;
      completedQuestions++;
    } else {
      //answer is incorrect
      $(event.currentTarget).addClass('incorrect');
      $(event.currentTarget).next('.incorrect-response').slideDown();
      completedQuestions++;
    }
    answerGiven = true;
    $(event.currentTarget).parent().next().find('.next').attr('disabled', false);
  })

  //handle 'next' button click
  $('.next').on('click', (event) => {
    let $currentContainer = $(event.currentTarget).closest('.quiz-container');
    let $nextContainer = $currentContainer.next('.quiz-container');
    let $nextNextContainer = $nextContainer.next('.quiz-container');
    $currentContainer.hide();
    $nextContainer.show();
    answerGiven = false;
    if ($nextContainer.find('.question').html() == '') {
      //quiz is finished
      $nextContainer.find('.question').html(`Quiz complete! You scored ${Math.round((score / completedQuestions) * 100)}%.`);
    }
  })

  //handle quiz like
  $('.like-quiz').on('click', (event) => {
    $(event.currentTarget).addClass('disabled');
    let likes = Number($('.quiz-likes').html());
    $('.quiz-likes').html(likes + 1);
    $('.like-message').html('Thank You!');
  })

  //handle category selection on home page
  $('.category-select').change(function() {
    let category = 'content/category/' + $('.category-select option:selected').attr('value');
    $('.explore-quizzes-button').attr('href', category).removeClass('disabled');
  })

  //handle quiz search on home page
  $('#search-quiz-input').change(() => {
    let name = $('#search-quiz-input').val();
    let url = '/content/quiz/search/' + name;
    $('#search-quiz-button').attr('href', url);
  })

})