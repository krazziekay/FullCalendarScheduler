/**
 * Function for handling API requests
 * @param url
 * @param method
 * @param body
 * @returns {Promise<any>}
 * @constructor
 */
let API_REQUEST = (url, method = 'GET', body = '') => {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: SCHEDULER_URL + url,
            method: method,
            beforeSend: function (request) {
                request.setRequestHeader('Authorization', 'Bearer ' + ACCESS_TOKEN);
                request.setRequestHeader('Company-User-Access', COMPANY_TOKEN);
            },
            dataType: 'json',
            data: body,
            success: resolve,
            error: reject,
        });
    });
};

/**
 * Over riding the drag function to enable the smooth dragging of full calendar
 */
let overrideDragFunction = () => {
    $.fullCalendar.views.timeline.class.prototype.renderDrag = () => {
        return false;
    };
    $.fullCalendar.views.agenda.class.prototype.renderDrag = () => {
        return false;
    };
};

/*
Function to get rid of the single quotes, double quotes, tabs and enters
 */
let escapeSpecialCharacters = (str) => {
    return (str.replace(/["']/g, '\\\'')).replace(/\s/g, ' ');
};

/**
 * Function that converts the special characters inside JSONstringify to HTML codes
 * @param str
 * @returns {*}
 */
let convertStringToHTMLCharacters = (str) => {
    return str.replace(/"/g, "&quot;").replace(/'/g, "&#39").replace(/>/g, "&#8250").replace(/</g, "&#8249");
};


/**
 * Function to simply change date based on number of days, months or year
 * @param momentDate -> Date
 * @param number -> 1, 2, 3.....30
 * @param dateAttribute -> month, year or day
 * @param status
 * @returns {string | *}
 */
let changeDate = (momentDate, number, dateAttribute, status) => {
    switch (status) {
        case 'prev':
            return moment(momentDate).subtract(number, dateAttribute).format('YYYY-MM-DD');
        case 'next':
            return moment(momentDate).add(number, dateAttribute).format('YYYY-MM-DD');
        default:
            return moment(momentDate).format('YYYY-MM-DD');
    }
};

/**
 * Function to convert an array of objects with structure {name: '', value:''} into an object with {name: value}
 * @param arr
 */
let getFormParamsAndConvertToObject = (arr) => {
    let returnObj = {};
    arr.map(el => {
        returnObj[el.name] = el.value;
    });
    return returnObj;
};

/**
 * Function to display notification
 * @param response
 */
let showNotification = (response) => {
    switch (response.code) {
        case 800:
            toastr.success(response.message);
            break;
        case 555:
            toastr.info(response.message);
            break;
        default:
            toastr.error(response.message);
            break;
    }
};

/**
 * Function to check if the event date is previous or current, to avoid operations for previous dates
 * @param event
 * @returns {boolean}
 */
let checkDate = (event) => {
    if (event.start.isBefore(moment())) {
        showNotification({code: 555, message: 'Can not update for previous dates!'});
        return true;
    }
    return false;
};


/**
 * Function that returns an array of time
 * @returns {Array}
 */
let getHoursInArray = () => {
    let locale = 'en'; // or whatever you want...
    let hours = [];

    moment.locale(locale);  // optional - can remove if you are only dealing with one locale

    for (let hour = WORKING_START_HOUR; hour < WORKING_END_HOUR; hour++) {
        for (let mins = 0; mins < 60; mins += 30) {
            hours.push({
                value: moment({hour, minute: mins}).format('H:mm'),
                label: moment({hour, minute: mins}).format('hh:mm a')
            });
        }
    }
    return hours;
};

let startSkedulerRenderingTimer = (timerFlag) => {
    let timer = 0;

    if (timerInterval) {
        timerInterval = setInterval(() => {
            timer++;
            timerFlag = false;
            if (timer >= 100) {
                console.log("Refresh now");
                clearInterval(timerInterval);
                timer = 0;
            }

        }, 100);
    }
};

let nullChecker = (str) => {
    if (str)
        return str;
    else
        return '-';
};


/**
 * Function to change the color af an event, when dragged
 * @param event
 * @param newId
 */
let updateEventsInView = (event, newId = 0) => {
    if (event.type === 'external') {
        event.start = event.job_starttime;
        event.end = event.job_endtime;
        event.resourceId = event.technician_id;
        event.id = newId;
        event.title = event.title + ' - Undispatched';
        event.title += '\n Client Address: ' + event.eventDetails.client.addressline + '\n' + event.eventDetails.job_priority.description + ', ' + event.eventDetails.job_status.description;
        event.scheduler_type = parseInt(event.scheduler_type);

        let refactoredEvent = Object.assign({}, event);
        delete refactoredEvent['eventDetails'];
        delete refactoredEvent['job_starttime'];
        delete refactoredEvent['job_endtime'];
        delete refactoredEvent['technician_id'];

        SCHEDULER_DOM.fullCalendar('renderEvent', refactoredEvent);
    }

};