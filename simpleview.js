const svk = 'simpleViewMain';
let sv_dragging = false;
let sv_diversion = {x: 0, y: 0};
let stored_touch;

function fixInCenter() {
    document.querySelectorAll('.' + svk).forEach((element) => {
        element.style.transition = '';
        element.style.transform = '';
        let rect = element.getBoundingClientRect();
        element.style.position = 'fixed';
        element.style.top = (window.innerHeight - rect.height) / 2 + 'px';
        element.style.left = (window.innerWidth - rect.width) / 2 + 'px';
        let scaleX = window.innerWidth / rect.width;
        let scaleY = window.innerHeight / rect.height;
        let scale = Math.min(scaleX, scaleY);
        element.style.transform = `scale(${scale})`;
        element.setAttribute('scale', scale);
        element.style.transformOrigin = '';
        sv_diversion = {x: 0, y: 0};
    });
};

function svAdjust(element, dimension, amount) {
    let scale = parseFloat(element.getAttribute('scale'));
    amount /= scale;
    if (dimension === 'x') {
        element.style.left = parseFloat(element.style.left.replace('px','')) + amount + 'px';
        sv_diversion.x += amount;
    } else {
        element.style.top = parseFloat(element.style.top.replace('px','')) + amount + 'px';
        sv_diversion.y += amount;
    };
    let rect = element.getBoundingClientRect();
    let originX = rect.width / scale / 2 - sv_diversion.x;
    let originY = rect.height / scale / 2 - sv_diversion.y;
    let origin = originX + 'px ' + originY + 'px';

    element.style.transformOrigin = origin;
};

function calcDist(touch1, touch2) {
    return Math.sqrt((touch2.pageX - touch1.pageX) ** 2 + (touch2.pageY - touch1.pageY));
}

function simpleViewInit(element) {
    element.classList.add(svk);
    fixInCenter();
    document.body.onresize = fixInCenter;
    element.onmousedown = () => {
        sv_dragging = true;
    };
    document.body.onmouseup = () => {
        sv_dragging = false;
    };
    document.body.onmousemove = function(event) {
        if (sv_dragging) {
            let element = document.querySelector('.' + svk);
            svAdjust(element, 'x', event.movementX);
            svAdjust(element, 'y', event.movementY);
        }
    };
    element.ontouchstart = () => {
        sv_dragging = true;
    };
    document.body.ontouchend = () => {
        sv_dragging = false;
        stored_touch = undefined;
    };
    document.body.ontouchmove = function(event) {
        let touch = event.touches;

        if (sv_dragging && stored_touch != undefined) {
            if (touch.length == 1) {
                let element = document.querySelector('.' + svk);
                svAdjust(element, 'x', touch[0].pageX - stored_touch[0].pageX);
                svAdjust(element, 'y', touch[0].pageY - stored_touch[0].pageY);
            } else if (touch.length >= 2) {
                let scale_diff;
                let new_distance = calcDist(touch[0], touch[1])
                let old_distance = calcDist(stored_touch[0], stored_touch[1])
                scale_diff = new_distance / old_distance;
                let old_scale = parseFloat(element.getAttribute('scale'));
                let scale = old_scale * scale_diff;
                element.setAttribute('scale', scale);
                element.style.transform = `scale(${scale})`;
            }
        }

        stored_touch = touch;
    };
    document.body.onwheel = function(event) {
        let scale_diff = 0;
        if (event.deltaY < 0) {
            scale_diff = 1.1;
        } else {
            scale_diff = 0.9;
        };
        let old_scale = parseFloat(element.getAttribute('scale'));
        let scale = old_scale * scale_diff;
        element.setAttribute('scale', scale);
        element.style.transform = `scale(${scale})`;
    }
};
