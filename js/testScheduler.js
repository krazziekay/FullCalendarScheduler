$(function () {


    $('#calendar').fullCalendar({
        defaultView: 'timelineDay',
        header: {
            left: 'prev,next',
            center: 'title',
            right: 'timelineDay,timelineWeek,timelineMonth'
        },
        selectHelper: true,
        editable: true,
        resourceLabelText: 'Rooms',
        // resources: 'https://fullcalendar.io/demo-resources.json',
        // events: 'https://fullcalendar.io/demo-events.json?with-resources',

        resources: (callback) => getResources(callback, selected_date),
        events: (start, end, timezone, callback) => getEvents(callback, selected_date),


    });

});