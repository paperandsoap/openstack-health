"use strict";

var controllersModule = require('./_index');

/**
 * @ngInject
 */
function ProjectCtrl($http, healthService, projectName) {

  // ViewModel
  var vm = this;

  vm.name = projectName;

  vm.processData = function(data) {
    // prepare chart data
    var jobs = {};
    var passEntries = [];
    var failEntries = [];

    if (!data.timedelta) {
      return;
    }

    data.timedelta.forEach(function(timedelta) {
      var totalPass = 0;
      var totalFail = 0;

      timedelta.job_data.forEach(function(job) {
        if (!jobs[job.job_name]) {
          var job_metrics = {
            name: job.job_name,
            passes: 0,
            failures: 0,
            failures_rate: 0
          };
          jobs[job.job_name] = job_metrics;
        }

        totalPass += job.pass;
        totalFail += job.fail;

        jobs[job.job_name].passes += job.pass;
        jobs[job.job_name].failures += job.fail;

        var successfulJobs = jobs[job.job_name].passes;
        var failedJobs = jobs[job.job_name].failures;

        jobs[job.job_name].failures_rate = ((failedJobs * 100) / (failedJobs + successfulJobs));
      });

      passEntries.push({
        x: new Date(timedelta.datetime).getTime(),
        y: totalPass
      });

      failEntries.push({
        x: new Date(timedelta.datetime).getTime(),
        y: totalFail
      });
    });

    vm.chartData = [
      { key: 'Passes', values: passEntries, color: 'blue' },
      { key: 'Failures', values: failEntries, color: 'red' }
    ];

    vm.jobs = jobs;
  }

  vm.loadData = function() {
    var start = new Date();
    start.setDate(start.getDate() - 20);

    healthService.getRunsFromProject(projectName, {
      start_date: start,
      datetime_resolution: 'hour',
    }).then(function(response) {
      vm.processData(response.data);
    });
  }

  vm.loadData();
}


controllersModule.controller('ProjectCtrl', ProjectCtrl);