(function($) {
    var $usernameField = $('#username-field'),
        $emailField = $('#email-field'),
        $passwordField = $('#password-field'),
        $submitButton = $('button[type="submit"]'),

        error_messages = {
            username_format: 'Username must be contain alphanumeric characters only',
            username_taken: 'Username is already taken',
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
        if (error) {
            addErrorState(element);
            $(element).siblings('.msg-wrapper').find('.msg-box').addClass('has-error').html(message);
        } else {
            addSuccessState(element);
            $(element).siblings('.msg-wrapper').find('.msg-box').html('');
        }
    }

    function updateSubmitButtonState() {
        if ($usernameField.val() !== "" && !$usernameField.hasClass('has-error') && $emailField.val() !== "" && !$emailField.hasClass('has-error') && $passwordField.val() !== "") {
            $submitButton.removeClass('is-disabled').prop('disabled', false);
        } else {
            $submitButton.addClass('is-disabled').prop('disabled', true);
        }
    }

    function addErrorState(element) {
        $(element).addClass('has-error').siblings('.msg-wrapper').find('.field-helperIcon').removeClass('success icon-ok').addClass('error icon-error');
        $(element).siblings('.msg-wrapper').find('.msg-box').addClass('has-error')
    }

    function addSuccessState(element) {
        $(element).removeClass('has-error').siblings('.msg-wrapper').find('.field-helperIcon').removeClass('error icon-error').addClass('success icon-ok');
        $(element).siblings('.msg-wrapper').find('.msg-box').removeClass('has-error')
    }

    function init() {
        $usernameField.on('keyup', function(event) {
            var error = !validateUsername(event.currentTarget.value);

            updateMessageBox(event.currentTarget, error, error_messages.username_format);

            if (error) {
                addErrorState(event.currentTarget);
                updateSubmitButtonState();
            } else {
                addSuccessState(event.currentTarget);
                updateSubmitButtonState();
            }
        });

        $usernameField.on('blur', function(event) {
            $.get('/api/get-all-user-displayname',function(users) {
                var error = false;

                _.forEach(users, function(user) {
                    if (user.display_name === event.currentTarget.value) {
                        error = true;
                    }
                });

                updateMessageBox(event.currentTarget, error, error_messages.username_taken);
            });
        });

        $emailField.on('blur', function(event) {
            var error = !validateEmail(event.currentTarget.value);

            updateMessageBox(event.currentTarget, error, error_messages.email);

            if (error) {
                addErrorState(event.currentTarget);
                updateSubmitButtonState();
            } else {
                addSuccessState(event.currentTarget);
                updateSubmitButtonState();
            }
        });

        $passwordField.on('keyup', function(event) {
            updateSubmitButtonState();
        });
    }
    init();
}(jQuery));