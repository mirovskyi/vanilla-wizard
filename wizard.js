var Wizard = function(options) {
    var _step;
    var settings = {
        activeClass: 'active',
        hideInactiveContent: true,
        inactiveButtonAction: 'hide', //available actions: 'hide', 'disable'
        nextButton: null,
        prevButton: null,
        startStep: 1,
        stepContentClass: null,
        steps: null,
        after: function() {},
        before: function() {}
    };
    //Merge options
    for (var prop in options) {
        if (options.hasOwnProperty(prop)) {
            settings[prop] = options[prop];
        }
    }
    //Calculate steps count
    if (!settings.steps && settings.stepContentClass) {
        settings.steps = document.getElementsByClassName(settings.stepContentClass).length;
    }
    if (settings.startStep < 1 || settings.startStep > settings.steps) {
        settings.startStep = 1;
    }
    //Add button listeners
    if (settings.nextButton) {
        settings.nextButton.addEventListener('click', function() {
            goto(_step + 1);
        });
    }
    if (settings.prevButton) {
        settings.prevButton.addEventListener('click', function() {
            goto(_step - 1);
        });
    }

    /**
     * Change step
     * @param {int} newStep
     */
    var changeStep = function(newStep) {
        //Change steps content state
        if (settings.stepContentClass) {
            var steps = document.getElementsByClassName(settings.stepContentClass);
            for (var i = 0; i < steps.length; i++) {
                var stepIndex = i + 1;
                if (stepIndex === newStep) {
                    steps[i].classList.add(settings.activeClass);
                    if (settings.hideInactiveContent) {
                        steps[i].style.display = 'block';
                    }
                } else {
                    steps[i].classList.remove(settings.activeClass);
                    if (settings.hideInactiveContent) {
                        steps[i].style.display = 'none';
                    }
                }
            }
        }
        //Change buttons state
        handleButton(settings.nextButton, !isLast(newStep));
        handleButton(settings.prevButton, !isFirst(newStep));
        //Change current step
        _step = newStep;
    };

    /**
     * Dispatch after event
     * @param {int} current
     * @param {int} previous
     */
    var dispatchAfter = function(current, previous) {
        if (settings.after) {
            var event = {
                current: current,
                previous: previous,
                first: isFirst(current),
                last: isLast(current)
            };
            settings.after(event, this);
        }
    };

    /**
     * Dispatch before event
     * @param {int} current
     * @param {int} next
     * @returns {boolean}
     */
    var dispatchBefore = function(current, next) {
        if (settings.before) {
            var event = {
                current: current,
                next: next,
                first: isFirst(current),
                last: isLast(current)
            };
            return settings.before(event, this);
        }

        return true;
    };

    /**
     * Go to provided step
     * @param {int} newStep
     */
    var goto = function(newStep) {
        if (newStep < 1 || newStep > settings.steps) {
            throw new Error('Step is out of wizard bounds');
        }
        //Dispatch before event
        if (dispatchBefore(_step, newStep) === false) {
            return;
        }
        //Change step
        var prevStep = _step;
        changeStep(newStep);
        //Dispatch after event
        dispatchAfter(_step, prevStep);
    };

    /**
     * Change button state on changing step
     * @param {Element|null} button
     * @param {boolean} active
     */
    var handleButton = function(button, active) {
        if (!button) {
            return;
        }
        if (settings.inactiveButtonAction === 'hide') {
            button.style.display = active ? '' : 'none';
        } else {
            if (active) {
                button.removeAttribute('disabled');
                button.classList.remove('disabled');
            } else {
                button.setAttribute('disabled', 'disabled');
                button.classList.add('disabled');
            }
        }
    };

    /**
     * Check is first step
     * @param {int} step
     * @returns {boolean}
     */
    var isFirst = function(step) {
        return step <= 1;
    };

    /**
     * Check is last step
     * @param {int} step
     * @returns {boolean}
     */
    var isLast = function(step) {
        return step >= settings.steps;
    };

    return {
        back: function() {
            if (isFirst(_step)) {
                throw new Error('Failed to go previous step. You are on the first step.');
            }
            goto(_step - 1)
        },
        current: function() { return _step },
        first: function () { return goto(1) },
        isFirst: function() { isFirst(_step) },
        isLast: function() { isLast(_step) },
        jump: function(step) { goto(step) },
        last: function() { goto(settings.steps) },
        length: function() { return settings.steps },
        next: function() {
            if (isLast(_step)) {
                throw new Error('Failed to go next step. You have reached last step already.');
            }
            goto(_step + 1);
        },
        start: function() { changeStep(settings.startStep) }
    }
};
