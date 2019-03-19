/**
 * Document Ready
 */
$(function () {

    overrideDragFunction();

    initializeDynamicHeight();
    initializeScheduler();
    initializeDateAndTimePickers();
    initializeGeoCompleteForClientAddress($('#clientAddressSearch'), $('#clientAddressline'), $('#clientSuburb'), $('#clientState'), $('#clientPostcode'), true);
    initializeGeoCompleteForClientAddress($('#clientAddressSearch2'), $('#clientAddressline'), $('#clientSuburb'), $('#clientState'), $('#clientPostcode'));
    initializeGeoCompleteForClientAddress($('#mailingClientAddressSearch'), $('#mailingClientAddressline'), $('#mailingClientSuburb'), $('#mailingClientState'), $('#mailingClientPostcode'));
    initializeGeoCompleteForClientAddress($('#jobFilterClientAddress'), $('#jobFilterClientAddressline'), $('#jobFilterClientSuburb'), $('#jobFilterClientState'), $('#jobFilterClientPostcode'));
    getFormOptions();
    initializeForms();
    initializeOngoingEventsDragging();

    horizontalResourceDragging();
    // verticalResourceDragging();

    resetJobFilter();
});

/**
 * Initializing and configuring the options for Full Calendar Scheduler
 */
let initializeScheduler = () => {
    SCHEDULER_DOM.fullCalendar({
        defaultView: 'timelineDay',
        allDaySlot: false,
        defaultDate: moment(),
        minTime: MIN_TIME,
        maxTime: MAX_TIME,
        aspectRatio: 1.8,
        editable: true,
        droppable: true,
        selectable: true,
        eventLimit: true, // allow "more" link when too many events
        nowIndicator: true,
        height: initializeDynamicHeight().wrapperHeight,
        contentHeight: initializeDynamicHeight().contentHeight,
        header: false,
        dragOpacity: 1,
        // eventOverlap: false,
        // slotEventOverlap: false,
        // slotDuration: '00:30:00',
        // snapDuration: '00:05:00',

        // lazyFetching: true,

        drop: (date, event, UI, resourceId) => {//External Drop
            // $('.popover').remove();
            if (checkDate({start: moment(date)})) {
                return;
            }
            let jobDetails = JSON.parse($(UI.helper).attr('data-job'));
            dragEvents({
                sch_id: jobDetails.job_id,
                eventDetails: jobDetails,
                job_starttime: selected_date + ' ' + date.format('H:mm'),
                job_endtime: selected_date + ' ' + date.add('30', 'minutes').format('H:mm'),
                technician_id: resourceId,
                scheduler_type: '1',
                title: jobDetails.job_title,
                type: 'external',
                user_id: USER_ID//Currently Logged in User's Id
            }, (id) => {
                showNotification({code: 900, message: 'Can not move this job!'});
                SCHEDULER_DOM.fullCalendar('removeEventSource', id);
            });
        },
        resourceOrder: 'user_id',
        resourceLabelText: ' ',
        resources: (callback) => getResources(callback, selected_date),
        resourceAreaWidth: '10%',//Default width for the resources width for Timeline View
        resourceRender: (resource, el) => {
            let view = SCHEDULER_DOM.fullCalendar('getView').type;
            if (view === 'agendaDay') {
                el.append(
                    $('<small>(' + resource.eachTotalJobs + ')</small>').popover({
                        title: resource.title || '',
                        content: 'Total Jobs : ' + resource.eachTotalJobs,
                        trigger: 'hover',
                        placement: 'bottom',
                        container: 'body'
                    })
                )
            } else if (view === 'timelineDay') {
                el.find('.fc-cell-content').append(
                    $('<small>(' + resource.eachTotalJobs + ')</small>').popover({
                        title: resource.title,
                        content: 'Total Jobs : ' + resource.eachTotalJobs,
                        trigger: 'hover',
                        placement: 'bottom',
                        container: 'body'
                    })
                )
            }
        },
        events: (start, end, timezone, callback) => getEvents(callback, selected_date),
        eventTextColor: '#fff',
        eventDataTransform: (eventData) => {//Function to transform the data type attributes
            eventData.title = getEventDetails(eventData).content;
            eventData.textColor = getEventDetails(eventData).textColor;
            if (eventData.scheduler_type > 1) {
                eventData.backgroundColor = getEventDetails(eventData).bgColor;
                eventData.borderColor = getEventDetails(eventData).borderColor;
            }
            return eventData;
        },
        eventRender: (event, el) => {
        },
        eventDragPosition: 'y|free',


        eventResize: (event, delta, revertFunc) => {
            // $('.popover').remove();
            if (checkDate(event)) {
                revertFunc();
                return;
            }
            resizeEvents({
                scheduler_id: event.id,
                job_starttime: event.start.format(),
                job_endtime: event.end.format(),
                scheduler_type: event.scheduler_type,
                user_id: USER_ID//Currently Logged in User's Id
            }, revertFunc);
        },
        eventDragStart: (event, jsEvent, ui, view) => {
            // $('.popover').remove();
        },
        eventDrop: (event, delta, revertFunc) => {
            // $('.popover').remove();
            if (checkDate(event)) {
                revertFunc();
                return;
            }
            dragEvents({
                sch_id: event.id,
                job_starttime: event.start && event.start.format(),
                job_endtime: event.end && event.end.format(),
                technician_id: event.resourceId,
                scheduler_type: event.scheduler_type,
                type: 'internal',
                user_id: USER_ID//Currently Logged in User's Id
            }, revertFunc);
        },
        eventAfterRender: function (event, $el) {// For the bubble on events when hovered
            $el.popover({
                title: getEventDetails(event).head,
                content: event.text,
                trigger: 'hover',
                container: 'body',
                placement: 'top'
            })
        },
        eventClick: (event, jsEvent, view) => {
            if (event.temp_id < 0)
                return;

            if (event.scheduler_type === 1) {
                getJobSummaryDetails(event);
                toggleSideBar(3);
            } else {
                populateBlockData(event, $('#taskTimeBlockWrapper'));
                toggleSideBar(4);
            }
        },
        select: (start, end, jsEvent, view, resource) => {
            if (start.isBefore(moment())) {
                SCHEDULER_DOM.fullCalendar('unselect');
                return false;
            }

            setForms(start, end, resource, 2);
        },
        dayClick: (date, jsEvent, view, resource) => {
            // console.log('dayClick', date.format(), resource);
        },

        dayRender: (date, cell) => {
            // console.log("Check the hack ", date, cell);
        },
        //Triggered after every render
        viewRender: (view, element) => {
        },

    });
};

let initializeDateAndTimePickers = () => {
    $('.datepicker').datepicker({
        autoclose: true,
        todayHighlight: true,
        startDate: moment().format('YYYY-MM-DD'),
    });
    $('.datepicker').datepicker('date', moment().format('YYYY-MM-DD'));
    JOB_FILTER_DATE_RANGE_PICKER.daterangepicker({
        'autoApply': true,
        // 'autoUpdateInput': false,
        'locale': {
            cancelLabel: 'Clear',
            format: 'YYYY-MM-DD'
        }
    });

    JOB_FILTER_DATE_PICKER.val(moment(selected_date).format('D MMM, YYYY')).datepicker({
        format: 'd M, yyyy',
        autoclose: true,
        autoUpdateInput: false
    }).on('changeDate', (data) => {
        selected_date = changeDate(data.date, 0, 'day', 'default');
        SCHEDULER_DOM.fullCalendar('gotoDate', data.date);
    });
    let hoursArray = getHoursInArray();

    hoursArray.map(hour => {
        $('#job_starttime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#job_endtime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#timeBlockStartTime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#timeBlockEndTime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#taskStartTime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#taskEndTime').append('<option value="' + hour.value + '">' + hour.label + '</option>');

        $('#editTimeTaskStartTime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#editTimeTaskEndTime').append('<option value="' + hour.value + '">' + hour.label + '</option>');

        $('#edit_job_starttime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
        $('#edit_job_endtime').append('<option value="' + hour.value + '">' + hour.label + '</option>');
    });


};

let initializeForms = () => {
    $('#billingAddressWrapper').css('display', 'none');
    $('#filteredJobs').height(initializeDynamicHeight().filteredJobsHeight).css('overflow-y', 'scroll');

    $('#billingAddressOption').change((ev) => $('#billingAddressWrapper').toggle());
    $('#edit_billingAddressOption').change((ev) => {
        $('#edit_billingAddressWrapper').toggleClass('disabled-div');
        $('#edit_billingAddressWrapper').find('input').each((index, eachInput) => {
            $(eachInput).prop('disabled', (i, v) => !v);
        })
    });

    $('#existingClientSearchBtn').click(() => {
        getClientsList({
            addressline: $('#clientAddressline').val(),
            suburb: $('#clientSuburb').val(),
            state: $('#clientState').val(),
            postcode: $('#clientPostcode').val(),
            full_address: $('#clientAddressSearch').val()
        });
    });
};

/**
 * Function to initialize and save the address using Geocomplete
 */
let initializeGeoCompleteForClientAddress = (FullAddressDOM, AddresslineDOM, SuburbDOM, StateDOM, PostcodeDOM, clientSearchFlag = false) => {
    FullAddressDOM.geocomplete().bind("geocode:result", function (event, result) {
        FullAddressDOM.val(result.formatted_address);
        AddresslineDOM.val('');
        SuburbDOM.val('');
        StateDOM.val('');
        PostcodeDOM.val('');

        var addressline = '';
        $.each(result.address_components, function (index, geo) {
            if (typeof (geo.types) != 'undefined') {
                if (geo.types[0] === 'subpremise') {
                    addressline = addressline + geo.long_name + '/';
                } else if (geo.types[0] === 'street_number') {
                    addressline = addressline + geo.long_name + ' ';
                } else if (geo.types[0] === 'route') {
                    addressline = addressline + geo.long_name + ' ';
                    AddresslineDOM.val(addressline);
                } else if (geo.types[0] === 'locality') {
                    // addressline= addressline +  geo.long_name;
                    SuburbDOM.val(geo.long_name);
                } else if (geo.types[0] === 'administrative_area_level_1') {
                    StateDOM.val(geo.long_name);
                } else if (geo.types[0] === 'country') {
                    // $('#js_addressline='=).val(geo.long_name);
                } else if (geo.types[0] === 'postal_code') {
                    PostcodeDOM.val(geo.long_name);
                }
            }
        });
        if (clientSearchFlag) {
            $('#clientAddressSearch2').val(FullAddressDOM.val());
            getClientsList({
                full_address: FullAddressDOM.val(),
                addressline: AddresslineDOM.val(),
                suburb: SuburbDOM.val(),
                state: StateDOM.val(),
                postcode: PostcodeDOM.val(),
            });
        }

    });
};

/**
 * Function to get the dynamic Height for the scheduler
 * Works for both views
 * @returns {{wrapperHeight: number, contentHeight: number}}
 */
let initializeDynamicHeight = () => {
    let windowHeight = $(window).height();
    let unknownParamHeight = 55;//Default height for the header of the scheduler
    let topHeight = SCHEDULER_DOM.offset().top;
    let filterJobHeaderHeight = 88;
    let filterJobFormHeight = $('#jobFilterBody').height();
    return {
        wrapperHeight: windowHeight - (unknownParamHeight + topHeight),
        contentHeight: windowHeight - (unknownParamHeight + topHeight + SCHEDULER_HEADER_HEIGHT),
        filteredJobsHeight: windowHeight - (filterJobFormHeight + filterJobHeaderHeight)
    };
};


/**********************************************************************************************************************************************/
/**
 * DOM functions
 */
/**
 * Date Functions
 */
let goToPreviousDate = () => {
    selected_date = changeDate(selected_date, 1, 'day', 'prev');
    JOB_FILTER_DATE_PICKER.datepicker('setDate', moment(selected_date).format('DD MMM, YYYY'));
};

let goToNextDate = () => {
    selected_date = changeDate(selected_date, 1, 'day', 'next');
    JOB_FILTER_DATE_PICKER.datepicker('setDate', moment(selected_date).format('DD MMM, YYYY'));
};

let goToToday = () => {
    selected_date = moment().format('YYYY-MM-DD');
    JOB_FILTER_DATE_PICKER.datepicker('setDate', moment(selected_date).format('DD MMM, YYYY'));
};

/**
 * Function to change the views between scheduler view and dispatch view
 */
let changeView = () => {
    let view = SCHEDULER_DOM.fullCalendar('getView').type, changeToView = '';
    switch (view) {
        case 'timelineDay':
            changeToView = 'agendaDay';
            break;
        case 'agendaDay':
            changeToView = 'timelineDay';
            break;
        default:
            changeToView = 'agendaDay';
            break;
    }
    SCHEDULER_DOM.fullCalendar('changeView', changeToView);
};

/**
 * Function that saves the job
 * Takes the form which is currently active in the tab view
 */
let saveJob = (status) => {

    switch (status) {
        case 1: {
            let formData = $('#schedulerForm2');

            formData.append('<input type="hidden" name="user_id" value="' + USER_ID + '"/>');
            $('#dispatchConfirmBtn').click();//Ask for confirmation for Dispatching the job
            break;
        }
        case 2: {
            let formData = $('#schedulerForm3');

            formData.append('<input type="hidden" name="user_id" value="' + USER_ID + '"/>');
            addSchedulerTimeBlock(2, getFormParamsAndConvertToObject(formData.serializeArray()));
            break;
        }
        case 3: {
            let formData = $('#schedulerForm4');

            formData.append('<input type="hidden" name="user_id" value="' + USER_ID + '"/>');
            addSchedulerTimeBlock(3, getFormParamsAndConvertToObject(formData.serializeArray()));
            break;
        }
    }
};

/**
 * Function that sets the dispatch status for the job and then saves it as a Job
 * @param status
 */
let setDispatch = (status) => {
    if (status)
        $('#dispatch_status_id').val(2);
    else
        $('#dispatch_status_id').val(1);
    addScheduleJob(getFormParamsAndConvertToObject($('#schedulerForm2').serializeArray()));

};

/**
 * Function to edit Scheduler time blocks and tasks
 */
let editTaskTimeBlock = () => {
    let formData = $('#taskTimeBlockWrapper').find('form');
    editSchedulerTimeBlock(getFormParamsAndConvertToObject(formData.serializeArray()));
};

/**
 * Function to delete Scheduler time blocks
 */
let delTaskTimeBlock = () => {
    let formData = $('#taskTimeBlockWrapper').find('form');
    deleteSchedulerTimeBlock(getFormParamsAndConvertToObject(formData.serializeArray()));
};

/**
 * Function to add a new resource on the scheduler
 * @param newResource
 */
let addResource = (newResource) => {
    SCHEDULER_DOM.fullCalendar('addResource', newResource, true);//the last boolean flag is for the scroll option
};


let addEvent = (newEvent) => {
    // console.log("Check ", newEvent);
    SCHEDULER_DOM.fullCalendar('renderEvent', newEvent);//the last boolean flag is for the scroll option
};

/**
 * Function to search jobs based on the job search filter
 */
let jobFilter = () => {
    let formData = $('#jobFilterForm');
    getFilteredJobs(getFormParamsAndConvertToObject(formData.serializeArray()));
};

let resetJobFilter = () => {
    let formData = $('#jobFilterForm');
    formData[0].reset();
    getFilteredJobs(getFormParamsAndConvertToObject(formData.serializeArray()));
};

/**********************************************************************************************************************************************/
/**
 * Auto refreshing
 */

/**
 * Auto Refreshing Resources and Events
 */
setInterval(() => {
    // SCHEDULER_DOM.fullCalendar('removeEventSource', events);
    // SCHEDULER_DOM.fullCalendar('addEventSource', events);
    //
    // SCHEDULER_DOM.fullCalendar('option', {resources: resources});
    // SCHEDULER_DOM.fullCalendar('refetchResources');
}, REFRESH_TIME);

/**********************************************************************************************************************************************/
/**
 * Form functions
 */
/**
 * Function to load the modals in the scheduler
 * @param start
 * @param end
 * @param resource
 * @param entity
 */
let setForms = (start, end, resource, entity) => {
    clearForms();

    //Setting the dates and times in the forms
    $('#job_startdate').val(start.format('YYYY-MM-DD'));
    $('#job_starttime').val(start.format('H:mm'));
    $('#job_enddate').val(start.format('YYYY-MM-DD'));
    $('#job_endtime').val(end.format('H:mm'));

    $('#timeBlockStartDate').val(start.format('YYYY-MM-DD'));
    $('#timeBlockStartTime').val(start.format('H:mm'));
    $('#timeBlockEndDate').val(start.format('YYYY-MM-DD'));
    $('#timeBlockEndTime').val(end.format('H:mm'));

    $('#taskStartDate').val(start.format('YYYY-MM-DD'));
    $('#taskStartTime').val(start.format('H:mm'));
    $('#taskEndDate').val(start.format('YYYY-MM-DD'));
    $('#taskEndTime').val(end.format('H:mm'));


    switch (entity) {
        case 1: //For resources
            $('#resourceModalBtn').click();
            break;
        case 2: //For events
            $('#technicianId').val(resource.id);
            $('#timeTechnicianId').val(resource.id);
            $('#taskTechnicianId').val(resource.id);
            toggleSideBar(2);

            break;
        default:
            break;
    }
};

/**
 /**
 * Function to handle the form submissions in the scheduler
 * @param entity
 */
let addEntity = (entity) => {
    let form = $('#schedulerForm' + entity);
    switch (entity) {
        case 1:
            addResource({
                "id": new Date().getTime(),
                "title": form.find('input[name=techFirstName]').val() + ' ' + form.find('input[name=techLastName]').val(),
                "text": form.find('input[name=techFirstName]').val() + ' ' + form.find('input[name=techLastName]').val(),
                "start": "2019-02-22 06:30:00",
                "starttime": "06:30",
                "end": "2019-02-22 08:30:00",
                "endtime": "08:30",
                "eventColor": "#1f497d",
            });
            break;
        case 2:
            // console.log("Add events");
            break;
        default:
            break;
    }
    $('.close-modal').click();
};


/**********************************************************************************************************************************************/

/**
 * API calls
 */
let getResources = (callback, date = moment().format('YYYY-MM-DD')) => {
    API_REQUEST('scheduler/resources?start=' + date).then(response => {
        if (response.code === 800) {
            addTechniciansInDropdown(response.data);
            callback(response.data);
        }
    }).catch(error => {
        // console.log("Error ", error);
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {

    });
};

let getEvents = (callback, date = moment().format('YYYY-MM-DD')) => {
    API_REQUEST('scheduler/events?start=' + date).then(response => {
        if (response.code === 800) {
            callback(response.data);
        }
    }).catch(error => {
        // console.log("Error ", error);
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
    });

};

let getJobDetails = (id) => {
    API_REQUEST('scheduler/viewSchedulerJobSummaryAction').then(response => {
        if (response.code === 800)
            callback(response.data);
    }).catch(error => {
        console.log("Error ", error);
    }).finally(() => {
    });
};

let resizeEvents = (event, errorCallBack) => {
    API_REQUEST('scheduler/resize_action', 'POST', event).then(response => {
        if (response.code === 800)
            showNotification(response);
        else
            errorCallBack();
    }).catch(error => {
        // console.log("Error ", error);
        showNotification({code: 900, message: 'Internal server Error'});
        errorCallBack();
    }).finally(() => {
    });
};

let dragEvents = (event, errorCallBack) => {
    let refactoredEvent = Object.assign({}, event);
    delete refactoredEvent['eventDetails'];

    let newId = -1 * Date.now();
    updateEventsInView(event, newId);

    API_REQUEST('scheduler/move_action', 'POST', refactoredEvent).then(response => {
        if (response.code === 800) {
            showNotification(response);
            // event.id = response.data;
            // SCHEDULER_DOM.fullCalendar('updateEventSource', event);

        } else {
            if (refactoredEvent.type === 'external') {
                SCHEDULER_DOM.fullCalendar('removeEventSource', newId);
            } else
                errorCallBack();
        }
    }).catch(error => {
        if (refactoredEvent.type === 'external') {
            SCHEDULER_DOM.fullCalendar('removeEventSource', newId);
        } else
            errorCallBack();
    }).finally(() => {
    });
};

let dragResources = (resource) => {
    API_REQUEST('technicians/update_technician_group', 'POST', resource).then(response => {
        if (response.code === 800) {
            showNotification(response);
        } else {
            console.log("Check ", response)
            showNotification({code: 900, message: 'Internal server Error'});
        }
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});

    }).finally(() => {
    });
};


let addScheduleJob = (data) => {
    API_REQUEST('scheduler/save_scheduler_job', 'POST', data).then(response => {
        if (response.code === 800) {
            showNotification(response);
            toggleSideBar(1, true);
            $('.close').click();
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        SCHEDULER_DOM.fullCalendar('refetchEvents');
    });
};

/**
 * Function to add time blocks and tasks
 * @param condition -> 2 for time blocks, and 3 for tasks
 * @param data
 */
let addSchedulerTimeBlock = (condition, data) => {
    API_REQUEST('scheduler/save_scheduler_time_block', 'POST', data).then(response => {
        if (response.code === 800) {
            showNotification(response);
            toggleSideBar(condition, true);
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        SCHEDULER_DOM.fullCalendar('refetchEvents');
    });
};

let editSchedulerTimeBlock = (data) => {
    API_REQUEST('scheduler/edit_scheduler_time_block', 'POST', data).then(response => {
        if (response.code === 800) {
            showNotification(response);
            $('.close').click();
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        SCHEDULER_DOM.fullCalendar('refetchEvents');
    });
};

let editSchedulerJob = (data) => {
    API_REQUEST('scheduler/update_scheduler_job', 'POST', data).then(response => {
        if (response.code === 800) {
            showNotification(response);
            $('.close').click();
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        SCHEDULER_DOM.fullCalendar('refetchEvents');
    });
};

let deleteSchedulerJob = (data) => {
    API_REQUEST('scheduler/delete_scheduler_job', 'POST', {'scheduler_id': data.scheduler_id}).then(response => {
        if (response.code === 800) {
            showNotification(response);
            $('.close').click();
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        SCHEDULER_DOM.fullCalendar('refetchEvents');
    });
};

let deleteSchedulerTimeBlock = (data) => {
    API_REQUEST('scheduler/delete_scheduler_time_block', 'POST', data).then(response => {
        if (response.code === 800) {
            showNotification(response);
            $('.close').click();
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        SCHEDULER_DOM.fullCalendar('refetchEvents');
    });
};

let getJobSummaryDetails = (data) => {
    API_REQUEST('scheduler/scheduler_job/' + data.id).then(response => {
        if (response.code === 800)
            populateScheduleJobData(response.data);
    }).catch(error => {
        // console.log("check error ", error);
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
    });
};

let getFilteredJobs = (data) => {
    // return;
    API_REQUEST('jobs/ongoing_jobs', 'POST', data).then(response => {
        if (response.code === 800) {
            addToFilterJobList(response.data);
        } else
            showNotification({code: 900, message: 'Internal server Error'});
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {

    });
};

let getClientsList = (data) => {
    API_REQUEST('clients/search_client', 'POST', data).then(response => {
        if (response.code === 800) {
            populateClientsTable(response.data);
        }
    }).catch(error => {
        // console.log("WTf", error);
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
    });
};

/**********************************************************************************************************************************************/
