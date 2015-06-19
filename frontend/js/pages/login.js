(function($) {
    var $emailField = $('#email-field'),
        $passwordField = $('#password-field'),
        $submitButton = $('button[type="submit"]'),

        error_messages = {
            email: 'Please enter a valid email address'
        };

    function checkIfEmail(email) {
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

    function addErrorState(element) {
        $(element).addClass('error').siblings('.field-helperIcon').removeClass('success').addClass('error');
    }

    function addSuccessState(element) {
        $(element).removeClass('error').siblings('.field-helperIcon').removeClass('error').addClass('success');
    }

    function init() {
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