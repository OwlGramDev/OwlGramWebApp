const ApiLink = "//" + location.host + location.pathname;

let Translators = {
    init: async function (options) {
        if (!Telegram.WebApp.initDataUnsafe || !Telegram.WebApp.initDataUnsafe.query_id) {
            window.open("//owlgram.org", "_self");
            return;
        }
        Telegram.WebApp.ready();
        initRipple();
        let userID = Telegram.WebApp.initDataUnsafe.user.id;
        let resultAdminList = await request_get(ApiLink + "?action=getAdmins&secret=" + getEncodedSecret());
        loadButtons(resultAdminList.includes(userID));
        Telegram.WebApp.MainButton.setText("CONFIRM");
        Telegram.WebApp.MainButton.onClick(confirmChanges);
    }
}

function getEncodedSecret() {
    return encodeURIComponent(JSON.stringify(Telegram.WebApp.initDataUnsafe));
}

function loadButtons(isAdmin) {
    let cards = document.getElementsByClassName('card');
    let buttons = document.getElementsByClassName('action_buttons');
    let waitingTexts = document.getElementsByClassName('waiting_accept');
    let headerTexts = document.getElementsByClassName('section_descriptor');
    let adminHeader = document.getElementsByClassName('header')[0];
    let adminDivider = document.getElementsByClassName('divider')[0];
    let buttonHeader = document.getElementsByClassName('button_header')[0];
    let buttonHeader2 = document.getElementsByClassName('button_header2')[0];
    let noVars = document.getElementsByClassName('no_vars')[0];
    for (let i = 0; i < buttons.length; i++) {
        if (isAdmin) {
            buttons[i].style.display = ''
        }
    }
    for (let i = 0; i < waitingTexts.length; i++) {
        if (!isAdmin) {
            waitingTexts[i].style.display = ''
        }
    }
    for (let i = 0; i < cards.length; i++) {
        cards[i].style.display = ''
        cards[i].style.opacity = '1'
    }
    if (cards.length === 0) {
        noVars.style.display = ''
        noVars.style.opacity = '1'
        let lottieAn = bodymovin.loadAnimation({
            container: document.getElementsByClassName("sticker_not_found")[0],
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: 'https://files.owlgram.org/webapp/owl.json?v3',
            rendererSettings: {
                clearCanvas: true,
            }
        });
        lottieAn.addEventListener('data_ready', function () {
            document.getElementsByClassName("sticker_not_found")[0].style.backgroundImage = 'none';
        });
    }
    adminHeader.style.display = ''
    adminHeader.style.opacity = '1'
    adminDivider.style.display = ''
    adminDivider.style.opacity = '1'
    if (isAdmin && cards.length > 0) {
        buttonHeader.style.display = '';
        buttonHeader2.style.display = '';
    } else {
        buttonHeader.style.display = 'none';
        buttonHeader2.style.display = 'none';
    }
    for (let i = 0; i < headerTexts.length; i++) {
        headerTexts[i].style.display = ''
        headerTexts[i].style.opacity = '1'
    }
}

function toggleChoice(element) {
    document.body.classList.remove('can_animate_4');
    document.body.classList.add('can_animate');
    setTimeout(() => {
        if (element.style.width === '95px') {
            element.style.width = '45px';
            element.style.zIndex = '0';
        } else {
            element.style.width = '95px';
            element.style.zIndex = '10000';
        }
        checkButton();
    }, 25);
}

function checkButton() {
    let approved = document.getElementsByClassName('action');
    let foundChanges = 0;
    for (let i = 0; i < approved.length; i++) {
        approved[i].style.width === '95px' ? foundChanges++ : null;
    }
    if (foundChanges > 0) {
        Telegram.WebApp.MainButton.setText("CONFIRM " + foundChanges + "/" + (approved.length / 2) + " CHANGES");
        Telegram.WebApp.MainButton.show();
    } else {
        Telegram.WebApp.MainButton.hide();
    }
}

async function confirmChanges() {
    let buttons = document.getElementsByTagName('button');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].disabled = true;
    }
    document.body.style.animation = 'blur_animation .40s';
    document.body.style.filter = 'blur(5px)';
    Telegram.WebApp.MainButton.setText("APPLYING...");
    Telegram.WebApp.MainButton.showProgress(false);
    await request_get(ApiLink + "?action=confirmChanges&secret=" + getEncodedSecret() + "&data=" + getSelectedPreferences());
    Telegram.WebApp.close();
}

function getSelectedPreferences() {
    let buttons = document.getElementsByTagName('button');
    let selectedPreferences = {
        delete: [],
        approve: [],
    }
    for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].style.width === '95px') {
            if (buttons[i].classList.contains('reject_action')) {
                selectedPreferences.delete.push(parseInt(buttons[i].id));
            } else {
                selectedPreferences.approve.push(parseInt(buttons[i].id));
            }
        }
    }
    return encodeURIComponent(JSON.stringify(selectedPreferences));
}

async function request_get(link){
    return await (await fetch(link, {
        method: 'GET',
    })).json()
}

async function selectAll(isApprovation) {
    document.body.classList.remove('can_animate');
    document.body.classList.add('can_animate_4');
    let aButtons = document.getElementsByClassName('approve_action');
    let rButtons = document.getElementsByClassName('reject_action');
    Telegram.WebApp.expand();
    for (let i = 0; i < aButtons.length; i++) {
        if (isApprovation) {
            aButtons[i].style.width = '95px';
            aButtons[i].style.zIndex = '10000';
        } else {
            aButtons[i].style.width = '45px';
            aButtons[i].style.zIndex = '0';
        }
    }
    for (let i = 0; i < rButtons.length; i++) {
        if (isApprovation) {
            rButtons[i].style.width = '45px';
            rButtons[i].style.zIndex = '0';
        } else {
            rButtons[i].style.width = '95px';
            rButtons[i].style.zIndex = '10000';
        }
    }
    setTimeout(() => {
        document.body.classList.add('can_animate');
        document.body.classList.remove('can_animate_4');
    }, 250);
    checkButton();
}

function initRipple() {
    if (!document.querySelectorAll) return;
    const rippleHandlers = document.querySelectorAll('.ripple-handler');
    const redraw = function (el) {
        el.offsetTop + 1;
    };
    const isTouch = ('ontouchstart' in window);
    for (let i = 0; i < rippleHandlers.length; i++) {
        (function(rippleHandler) {
            function onRippleStart(e) {
                let clientY;
                let clientX;
                const rippleMask = rippleHandler.querySelector('.ripple-mask');
                if (!rippleMask) return;
                const rect = rippleMask.getBoundingClientRect();
                if (e.type === 'touchstart') {
                    clientX = e.targetTouches[0].clientX;
                    clientY = e.targetTouches[0].clientY;
                } else {
                    clientX = e.clientX;
                    clientY = e.clientY;
                }
                const rippleX = (clientX - rect.left) - rippleMask.offsetWidth / 2;
                const rippleY = (clientY - rect.top) - rippleMask.offsetHeight / 2;
                const ripple = rippleHandler.querySelector('.ripple');
                ripple.style.transition = 'none';
                redraw(ripple);
                ripple.style.transform = 'translate3d(' + rippleX + 'px, ' + rippleY + 'px, 0) scale3d(0.2, 0.2, 1)';
                ripple.style.opacity = "1";
                redraw(ripple);
                ripple.style.transform = 'translate3d(' + rippleX + 'px, ' + rippleY + 'px, 0) scale3d(1, 1, 1)';
                ripple.style.transition = '';

                function onRippleEnd(_) {
                    ripple.style.transitionDuration = 'var(--ripple-end-duration, .2s)';
                    ripple.style.opacity = "0";
                    if (isTouch) {
                        document.removeEventListener('touchend', onRippleEnd);
                        document.removeEventListener('touchcancel', onRippleEnd);
                    } else {
                        document.removeEventListener('mouseup', onRippleEnd);
                    }
                }
                if (isTouch) {
                    document.addEventListener('touchend', onRippleEnd);
                    document.addEventListener('touchcancel', onRippleEnd);
                } else {
                    document.addEventListener('mouseup', onRippleEnd);
                }
            }
            if (isTouch) {
                rippleHandler.removeEventListener('touchstart', onRippleStart);
                rippleHandler.addEventListener('touchstart', onRippleStart);
            } else {
                rippleHandler.removeEventListener('mousedown', onRippleStart);
                rippleHandler.addEventListener('mousedown', onRippleStart);
            }
        })(rippleHandlers[i]);
    }
}