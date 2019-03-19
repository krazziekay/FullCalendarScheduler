/**
 * Function to populate Time Block Modal
 * @param event
 * @param DOM
 */
let populateBlockData = (event, DOM) => {
    DOM.find('#title').attr('value', event.title.replace(TIMEBLOCKCONCATENATIONSTRING, '').replace(TASKCONCATENATIONSTRING, ''));
    DOM.find('#description').text(nullChecker(event.bubbleHtml));
    DOM.find('#id').attr('value', event.id);
    DOM.find('#editTimeTaskStartDate').attr('value', event.start.format('YYYY-MM-DD'));
    DOM.find('#editTimeTaskStartTime').val(moment(event.starttime, 'HH:mm').format('H:mm'));
    DOM.find('#editTimeTaskEndDate').attr('value', event.start.format('YYYY-MM-DD'));
    DOM.find('#editTimeTaskEndTime').val(moment(event.endtime, 'HH:mm').format('H:mm'));
};

/**
 * Function to populate Job Details Modal of a normal scheduled Job
 * @param event
 * @param DOM
 */
let populateScheduleJobData = (event) => {
    $('#salesAmount').text('$' + nullChecker(event.saleSummary.sale));
    $('#paidAmount').text('$' + nullChecker(event.saleSummary.payment));
    $('#outstandingAmount').text('$' + nullChecker(event.saleSummary.outstanding));

    $('#summaryJobTitle').text(nullChecker(event.scheduler.jobs.job_title));
    $('#summaryJobStatus').text(nullChecker(event.scheduler.jobs.job_status.description));
    $('#summaryJobDescription').text(nullChecker(event.scheduler.jobs.job_description));
    $('#summaryCalloutFee').text('$' + nullChecker(event.scheduler.jobs.job_calloutfee));
    $('#summaryJobType').text(nullChecker(event.scheduler.jobs.job_type.description));
    $('#summaryJobCategory').text(nullChecker(event.scheduler.jobs.job_category.description));
    $('#summaryJobPriority').text(nullChecker(event.scheduler.jobs.job_priority.description));

    $('#summaryClientName').text(nullChecker(event.scheduler.clients.first_name + ' ' + event.scheduler.clients.last_name));
    $('#summaryClientAddress').text(nullChecker(event.scheduler.clients.full_address));
    $('#summaryClientPhone').text(nullChecker(event.scheduler.clients.phone));
    $('#summaryClientEmail').text(nullChecker(event.scheduler.clients.email));
    $('#summaryClientMobile').text(nullChecker(event.scheduler.clients.mobile));
    $('#summaryClientType').text(nullChecker(event.scheduler.clients.client_type && event.scheduler.clients.client_type.description));

    $('#summaryBillingClientName').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_firstname + ' ' + event.scheduler.clients.client_mailing[0].mailing_lastname));
    $('#summaryBillingClientAddress').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_fulladdress));
    $('#summaryBillingClientPhone').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_phone));
    $('#summaryBillingClientEmail').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_email));
    $('#summaryBillingClientMobile').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_mobile));


    $('#visitTechnician').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_mobile));
    $('#visitStartTime').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_mobile));
    $('#visitEndTime').text(nullChecker(event.scheduler.clients.client_mailing[0].mailing_mobile));

    $('#visitList').empty();
    event.jobVisits.map(jobVisit => {
        let visit = '<div class="chat-user ">\n' +
            '                        <div class="panel-tools">\n' +
            '                            <div class="clearfix m-b-8 right-align"></div>\n' +
            '                        </div>\n' +
            '                        <img alt="profile picture" class="chat-avatar"\n' +
            '                             src="https://app.skeduler.com.au/upload/users/prof-picture-unassigned.jpg">\n' +
            '                        <div class="chat-user-name m-l-60"><b align="text-center">' + nullChecker(jobVisit.technicians.user.first_name) + ' ' + nullChecker(jobVisit.technicians.user.last_name) + ' </b>\n' +
            '                            <div class="small">' + moment(jobVisit.job_starttime).format('Do MMM, YYYY') +
            '                               (' + moment(jobVisit.job_starttime).format('h:mm A') + ' - ' + moment(jobVisit.job_endtime).format('h:mm A') + ' )' + ' </div>\n' +
            '                               <p>' + checkWorkStatus(jobVisit.work_status) + '</p>\n' +
            '                               <p class="small">' + checkJSA(jobVisit.jsa_check) + '</p>' +
            '                           </div>\n' +
            '                    </div>';
        $('#visitList').append(visit);
    });

};

let populateClientsTable = (data) => {
    if (data.length) {
        $('#existingClientsTableWrapper').show();
        data.map(client => {
            let row = ' <tr class="list-group-item-action cursor-pointer" onclick=\'populateClientsDataInForm(' + JSON.stringify(client) + ')\'>' +
                '                        <td>' + nullChecker(client.first_name) + ' ' + client.last_name + '</td>' +
                '                        <td>' + nullChecker(client.addressLine) + '</td>' +
                '                        <td>' + nullChecker(client.suburb) + '</td>' +
                '                    </tr>';
            $('#existingClientsTable').append(row);
        });
    } else {
        $('#existingClientsTableWrapper').hide();
        $('#existingClientsTable').empty();
    }
};

let populateClientsDataInForm = (clientData) => {
    $('#client_id').val(clientData.client_id);
    $('#first_name').val(clientData.first_name);
    $('#last_name').val(clientData.last_name);
    $('#clientAddressSearch2').val(clientData.full_address);
    $('#client_typeid').val(clientData.client_typeid);
    $('#phone').val(clientData.phone);
    $('#mobile').val(clientData.mobile);
    $('#email').val(clientData.email);
    $('#clientAddressline').val(clientData.addressline);
    $('#clientSuburb').val(clientData.suburb);
    $('#clientState').val(clientData.state);
    $('#clientPostcode').val(clientData.postcode);

};

/**
 * Function to fill the form dropdown options with job types, categories, priorities, status, callout fee and adsources
 * @type {Array}
 */
let jobCategoriesAndJobTypes = [];
let getFormOptions = () => {
    API_REQUEST('get_form_options').then(response => {
        if (response.code === 800) {
            response.data.clientTypes.map(clientType => {
                $('#client_typeid').append('<option value="' + clientType.client_typeid + '">' + clientType.description + '</option>');
            });
            response.data.jobCategories.map(jobCategory => {
                $('#job_catid').append('<option value="' + jobCategory.cat_id + '">' + jobCategory.description + '</option>');
                $('#jobFilterJobCategory').append('<option value="' + jobCategory.cat_id + '">' + jobCategory.description + '</option>');
            });
            response.data.jobCategories[0].types.map(jobType => {
                $('#job_typeid').append('<option value="' + jobType.jobtype_id + '">' + jobType.description + '</option>');
                $('#jobFilterJobType').append('<option value="' + jobType.jobtype_id + '">' + jobType.description + '</option>');
            });

            response.data.jobPriorities.map(jobPriority => {
                $('#job_pid').append('<option value="' + jobPriority.priority_id + '">' + jobPriority.description + '</option>');
            });
            response.data.jobStatus.map(jobStatus => {
                $('#job_statusid').append('<option value="' + jobStatus.job_statusid + '">' + jobStatus.description + '</option>');
                $('#jobFilterJobStatus').append('<option value="' + jobStatus.job_statusid + '">' + jobStatus.description + '</option>');
            });
            response.data.callOutFee.map(callOutFee => {
                $('#job_calloutfee').append('<option value="' + callOutFee.fee + '"> $' + callOutFee.fee + '</option>');
            });
            response.data.adSources.map(adSource => {
                $('#adSource_id').append('<option value="' + adSource.id + '"> $' + adSource.name + '</option>');
            });
            jobCategoriesAndJobTypes = response.data.jobCategories;
        }
    }).catch(error => {
        showNotification({code: 900, message: 'Internal server Error'});
    }).finally(() => {
        settingJobTypesPerCategory($('#job_catid'), $('#job_typeid'));
        settingJobTypesPerCategory($('#jobFilterJobCategory'), $('#jobFilterJobType'));
    });
};


/**
 * Function to reset / clear all the forms
 */
let clearForms = () => {
    $('form').each((index, eachForm) => {
        eachForm.reset();
    });
    $('#existingClientsTableWrapper').hide();
    $('#existingClientsTable').empty();

    $('#clientAddressSearch').val('');
    $('#clientAddressline').val('');
    $('#clientSuburb').val('');
    $('#clientState').val('');
    $('#clientPostcode').val('');
};

/**
 * Function to display the JSA status
 * @param flag
 * @returns {string}
 */
let checkJSA = (flag) => {
    let approvedColor = '#62cb31';
    let disapprovedColor = '#c0392b';
    switch (parseInt(flag)) {
        case 1:
            return ('' +
                '<span class="cursor-pointer" >' +
                '<i style="color: ' + approvedColor + '" class="fa fa-check-circle m-r-8"></i>&nbsp;<span style="color:' + approvedColor + '">JSA approved</span>' +
                '</span>');
        default:
            return ('' +
                '<span class="cursor-pointer" >' +
                '<i style="color:' + disapprovedColor + '" class="fa fa-times-circle m-r-8"></i>&nbsp;<span style="color:' + disapprovedColor + '">JSA not approved</span>' +
                '</span>');
    }
};


/**
 * Function to display the visit status
 * @param status
 * @returns {string}
 */
let checkWorkStatus = (status) => {
    switch (status.toString()) {
        case '0':
            return '<span class="label label-primary">Visit Not Started</span>';
        case '1':
            return '<span class="label label-success">Visit Started</span>';
        case '2':
            return '<span class="label label-ongoing">Visit Completed</span>';
        default:
            return '<span class="label label-danger">Unknown Status</span>';
    }
};

/**
 * Side bar toggle
 * @param condition
 * @param close
 */
let toggleSideBar = (condition, close = null) => {
    if ($('.side-nav').width() > 0 && close) {
        $('#schedulerWrapper').css('margin-left', '0').width('width', '100 %');
        $('.side-nav').css('width', '0');
        enlargedJobFilterFormFlag = false;

    } else {
        $('#schedulerWrapper').css('margin-left', '20%').width('width', '80 %');
        $('.side-nav').css('width', '20%');
    }
    $('.side-nav').each((index, el) => $(el).hide());
    switch (condition) {
        case 1: {
            $('#jobFilter').show();
            break;
        }
        case 2: {
            $('#eventModalWrapper').show();
            enlargedJobFilterFormFlag = false;
            break;
        }
        case 3: {
            $('#scheduleSummaryWrapper').show();
            enlargedJobFilterFormFlag = false;
            break;
        }
        case 4: {
            $('#taskTimeBlockWrapper').show();
            enlargedJobFilterFormFlag = false;
            break;
        }
    }

};

let enlargedJobFilterFormFlag = false;
let showEnlargedJobFilterForm = () => {
    if (enlargedJobFilterFormFlag) {
        $('#schedulerWrapper').css('margin-left', '20%').width('width', '80 %');
        $('.side-nav').css('width', '20%');
        $('.changecol').removeClass('col-sm-6').addClass('col-sm-12');
        $('#jobFilterByClients').hide();
        $('#jobFilterAdvancedForm').text('MORE OPTIONS');
    } else {
        $('#schedulerWrapper').css('margin-left', '40%').width('width', '60 %');
        $('.side-nav').css('width', '40%');
        $('.changecol').removeClass('col-sm-12').addClass('col-sm-6').addClass('pull-left');
        $('#jobFilterByClients').show();
        $('#jobFilterAdvancedForm').text('LESS OPTIONS');
    }
    $('#filteredJobs').height(initializeDynamicHeight().filteredJobsHeight).css('overflow-y', 'scroll');
    enlargedJobFilterFormFlag = !enlargedJobFilterFormFlag;
};


let changeTab = (tab, DOM) => {
    $('#tab1').hide();
    $('#tab2').hide();
    $('#tab3').hide();
    $('.service-options-li').each((index, list) => {
        $(list).removeClass('active');
    });
    $(DOM).parent().addClass('active');
    switch (tab) {
        case 1: {
            $('#tab1').show();
            break;
        }
        case 2: {
            $('#tab2').show();
            break;
        }
        case 3: {
            $('#tab3').show();
            break;
        }

    }
};

let settingJobTypesPerCategory = (DOM, JOBTYPE) => {
    DOM.change(ev => {
        JOBTYPE.empty().append('<option value="" disabled="">Choose type</option>');
        jobCategoriesAndJobTypes && jobCategoriesAndJobTypes.map(category => {
            if (parseInt(category.cat_id) === parseInt(ev.target.value)) {
                category.types.map(jobType => JOBTYPE.append('<option value="' + jobType.jobtype_id + '">' + jobType.description + '</option>'))
            }
        });
    });
};


let addToFilterJobList = (jobs) => {
    $('#filteredJobs').empty();
    jobs.map(job => {
        let listDiv = '<li  data-job=\'' + convertStringToHTMLCharacters(JSON.stringify(job)) + '\'>' +
            ' <p class="m-b-0 text-primary font-weight-bolder"> ' + job.job_title + '</p>' +
            ' <p class="text-muted m-b-0 clearfix">' +
            '   <span class="pull-left">' + job.job_status.description + '</span>' +
            '   <span class="pull-right">$' + job.job_calloutfee + '</span>' +
            '</p>' +
            '</li>';
        $('#filteredJobs').append(listDiv);
    });
    initializeOngoingEventsDragging();
};


let initializeOngoingEventsDragging = () => {
    $('#filteredJobs > li').each((index, el) => {
        // make the event draggable using jQuery UI
        $(el).draggable({
            appendTo: 'body',
            helper: 'clone',
            zIndex: 300,
            scroll: false,
            revert: true,      // will cause the event to go back to its
            revertDuration: 0,  //  original position after the drag
            cursor: 'move',
            start: (e, ui) => {
                $(ui.helper).addClass("draggable-placeholder");
            }

        });

    });
};

/**
 * Function to return the event details for any given event
 * @param event
 * @returns {string}
 */
let getEventDetails = (event) => {
    let details = {};
    if (event.scheduler_type === 1)
        details = {
            head: event.client_address + ' , (' + event.job_priority + ')',
            content: event.text + ' - ' + event.dispatch_status + '\n Client Address: ' + event.client_address + '\n' + event.job_priority + ', ' + event.job_status,
            // bgColor: event.tech_color,
            // borderColor: event.tech_color,
            textColor: '#fff',
        };
    else if (event.scheduler_type === 2)
        details = {
            head: 'Time Block',
            content: '\n' + TIMEBLOCKCONCATENATIONSTRING + event.text + '\n\n',
            bgColor: '#fff',
            borderColor: '#000',
            textColor: '#000',
        };
    else
        details = {
            head: 'Task',
            content: '\n' + TASKCONCATENATIONSTRING + event.text + '\n\n',
            bgColor: '#fff',
            borderColor: '#000',
            textColor: '#000',
        };
    return details;
};

/**
 * Function to add the technicians in the dropdown list in the forms
 * @param technicians
 */
let addTechniciansInDropdown = (technicians) => {
    technicians.map(technician => {
        $('#technicianId').append('<option value="' + technician.id + '">' + technician.title + '</option>');
        $('#timeTechnicianId').append('<option value="' + technician.id + '">' + technician.title + '</option>');
        $('#taskTechnicianId').append('<option value="' + technician.id + '">' + technician.title + '</option>');
        $('#jobFilterTechnicianId').append('<option value="' + technician.id + '">' + technician.title + '</option>');
    });
};


let horizontalResourceDragging = () => {
    let initialPos, finalPos;

    $(".fc-resource-area.fc-widget-content .fc-rows > table tbody").sortable({
        axis: "y"
    }).disableSelection()
        .on("sortstart", (event, ui) => {
            initialPos = ui.item.index();
        })
        .on("sortupdate", (event, ui) => {
            finalPos = ui.item.index();
            if (finalPos === -1) return; // "sortupdate" gets called twice for an unknown reason. Second time with finalPos == -1

            let tmpResources = [];

            let allResources = SCHEDULER_DOM.fullCalendar('getResources');

            let draggedFromResourceId = $(ui.item[0]).attr('data-resource-id');//Resource Id of dragged Resource
            let draggedToResource = allResources[finalPos];

            let draggedFromResource = SCHEDULER_DOM.fullCalendar('getResourceById', draggedFromResourceId);

            console.log("Updated from: ", draggedFromResource, " To: ", draggedToResource);


            //
            // for (let i = 0; i < resources.length; i++) {
            //     tmpResources.push(resources[i]);
            // }
            //
            //
            // // reorder sorting to match
            // if (finalPos > initialPos) {
            //     tmpResources[finalPos] = resources[initialPos];
            //     tmpResources[finalPos].sortOrder = finalPos + 1;
            //
            //     for (let i = initialPos + 1; i <= finalPos; i++) {
            //         //resources[i].sortOrder -= 1;
            //         tmpResources[i - 1] = resources[i];
            //         tmpResources[i - 1].sortOrder -= 1;
            //     }
            // } else {
            //     tmpResources[finalPos] = resources[initialPos];
            //     tmpResources[finalPos].sortOrder = finalPos + 1;
            //
            //     for (let i = initialPos - 1; i >= finalPos; i--) {
            //         //resources[i].sortOrder += 1;
            //         tmpResources[i + 1] = resources[i];
            //         tmpResources[i + 1].sortOrder += 1;
            //     }
            // }
            //
            // for (let i = 0; i < tmpResources.length; i++) {
            //     resources[i] = tmpResources[i];
            // }
            //
            // SCHEDULER_DOM.fullCalendar('refetchResources'); // refresh display
        });
};

let verticalResourceDragging = () => {
    let initialPos, finalPos;

    $("table thead tr").sortable({
        items: "> th:gt(0)",
        axis: "x"
    })
        .disableSelection()
        .on("sortstart", function (event, ui) {
            initialPos = ui.item.index() - 1; // need to subtract 1 because of the empty first header cell
        })
        .on("sortupdate", function (event, ui) {
            sortUpdate(event, ui);
        });

    let sortUpdate = (event, ui) => {
        finalPos = ui.item.index() - 1; // need to subtract 1 because of the empty first header cell

        if (finalPos === -1) return; // "sortupdate" gets called twice for an unknown reason. Second time with finalPos == -1

        var tmpResources = [];

        for (let i = 0; i < resources.length; i++) {
            tmpResources.push(resources[i]);
        }

        // reorder sorting to match
        if (finalPos > initialPos) {
            tmpResources[finalPos] = resources[initialPos];
            tmpResources[finalPos].sortOrder = finalPos + 1;

            for (let i = initialPos + 1; i <= finalPos; i++) {
                //resources[i].sortOrder -= 1;
                tmpResources[i - 1] = resources[i];
                tmpResources[i - 1].sortOrder -= 1;
            }
        } else {
            tmpResources[finalPos] = resources[initialPos];
            tmpResources[finalPos].sortOrder = finalPos + 1;

            for (let i = initialPos - 1; i >= finalPos; i--) {
                //resources[i].sortOrder += 1;
                tmpResources[i + 1] = resources[i];
                tmpResources[i + 1].sortOrder += 1;
            }
        }

        for (let i = 0; i < tmpResources.length; i++) {
            resources[i] = tmpResources[i];
        }

        SCHEDULER_DOM.fullCalendar('refetchResources'); // refresh display

        // sorting is lost after a refetch when in vertical display, so need to reapply:
        $("table thead tr").sortable({
            items: "> th:gt(0)",
            axis: "x"
        })
            .disableSelection()
            .on("sortstart", function (event, ui) {
                initialPos = ui.item.index() - 1; // need to subtract 1 because of the empty first header cell
            })
            .on("sortupdate", function (event, ui) {
                sortUpdate(event, ui);
            });
    }
};
