(function($) {
    var $usernameField = $('#username-field'),
        $emailField = $('#email-field'),
        $passwordField = $('#password-field'),
        $submitButton = $('button[type="submit"]'),

        error_messages = {
            username: 'Username must be contain alphanumeric characters only',
            email: 'Please enter a valid email address'
        };

    function validateUsername(username) {
        var username_reg = new RegExp(/^[A-Z0-9a-z]+$/);

        return username_reg.test(username);
    }

    function validateEmail(email) {
        var email_reg = new RegExp(/[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4}/);

        return email_reg.test(email);
    }

    function updateMessageBox(element, error, message) {
        // Check if there is an error or not.
        if(error) {
            $(element).siblings('.msg-box').html(message)
        } else {
            $(element).siblings('.msg-box').html('');
        }
    }

    function disableSubmitButton() {
        $submitButton.addClass('disabled').attr('disabled', 'disabled');
    }

    function enableSubmitButton() {
        $submitButton.removeClass('disabled').removeAttr('disabled');
    }

    function addErrorState(element) {
        $(element).addClass('error').siblings('.field-helperIcon').removeClass('success').addClass('error');
    }

    function addSuccessState(element) {
        $(element).removeClass('error').siblings('.field-helperIcon').removeClass('error').addClass('success');
    }

    function init() {
        $usernameField.on('keyup', function(event) {
            var error = !validateUsername(event.currentTarget.value);

            updateMessageBox(event.currentTarget, error, error_messages.username);

            if(error) {
                addErrorState(event.currentTarget);
                disableSubmitButton();
            } else {
                addSuccessState(event.currentTarget);
                enableSubmitButton();
            }
        });

        $emailField.on('blur', function(event) {
            var error = !validateEmail(event.currentTarget.value);

            updateMessageBox(event.currentTarget, error, error_messages.email);

            if(error) {
                addErrorState(event.currentTarget);
                disableSubmitButton();
            } else {
                addSuccessState(event.currentTarget);
                enableSubmitButton();
            }
        });
    }
    init();
}(jQuery));