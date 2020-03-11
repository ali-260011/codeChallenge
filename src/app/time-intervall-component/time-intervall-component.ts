import { Component, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartOptions } from 'chart.js';
import { GoogleChartComponent } from 'angular-google-charts'
// import Chart = require('chart.js');
export interface ResponseDto {
    date: Date;
    comptage: number;
    timestamp: number;
}

@Component({
    selector: 'app-time-intervall-component',
    templateUrl: './time-intervall-component.html',
    styleUrls: ['./time-intervall-component.sass']
})
export class TimeIntervallComponent {
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    startDate = new Date('de');
    endDate = new Date('de');
    today = new Date().toISOString().split("T")[0];
    dayOfWeekWithHighestCounts = '';
    dayOfWeekWithLeastCounts = '';
    responseToDisplay = [] as ResponseDto[];
    leastDayCount = {} as ResponseDto;
    highestDayCount = {} as ResponseDto;
    averageCount: number = 0;
    totalCount: number = 0;
    invalidDate = false;
    options: ChartOptions = {};
    chartType = 'line';
    chartData: any = [];

    @ViewChild('chart') chart: Chart;

    constructor(private httpClient: HttpClient) {
    }
    

    showResult() {
        const begin = this.parseDate(this.startDate)
        const end = this.parseDate(this.endDate);
        const invalidUrl = 'http://www.eco-public.com/api/cw6Xk4jW4X4R/data/periode/102032236/?begin='
            + begin + '&end=' + end + '&step=4';
        const requestUrl = invalidUrl.replace(/"/g, '');
        this.httpClient.get(requestUrl).subscribe((result: ResponseDto[]) => {
            if (result) {
            this.responseToDisplay = result;
            } else {
                //TODO: corner case where backend returns null.
                console.log('there are no data found');
            }
        },
            (err) => { console.log('Error occured while loading data') },
            () => {
                this.getDayWithLeastCounts(this.responseToDisplay);
                this.getDayWithHighestCounts(this.responseToDisplay);
                this.getAverageOfCounts(this.responseToDisplay);
                this.getTotalCounts(this.responseToDisplay);
                this.options = this.initializeChartOptions();
                this.chartData = this.initializeChartDatasets(this.responseToDisplay);
                this.displayLineChart();
            });
    }

    public displayLineChart() {
         this.chart.options = this.options;
         this.chart.data = this.chartData;
    }

    public checkDateValidation() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            this.invalidDate = true;
        }
        else {
            this.invalidDate = false;
        }
    }
    public initializeChartDatasets(responseData: ResponseDto[]) {
        return {
            data: {
                labels: responseData.map(elem => elem.date.toString()),
                datasets: [{
                        label: "One",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: responseData.map(elem => elem.comptage)
                }]
            }
        }
    }

    public initializeChartOptions(): any {
        return {
            showLines: true,
            scales: {
                xAxes: this.initializeXAxis(),
                yAxes: this.initializeYAxis(),
            }
        }

    }
    initializeAxes() {
        this.initializeXAxis();
        this.initializeYAxis()
    }
    initializeXAxis(): any[] {
        return [{
            labels: this.responseToDisplay.map(elem => elem.date.toString()),
            type: 'time',
                time: {
                    unit: 'hour'
                },
            position: 'bottom',
            id: 'x-axis'
        }];
    }

    initializeYAxis(): any[] {
        return [{
            type: 'linear',
            position: 'left',
            id: 'y-axis',
        }]
    }


    public getDayWithLeastCounts(data: ResponseDto[]): void {
        this.leastDayCount = data.reduce(function (res, obj) {
            return (obj.comptage < res.comptage) ? obj : res;
        });
        const dayOfWeek = new Date(this.leastDayCount.date);
        this.dayOfWeekWithLeastCounts = this.days[dayOfWeek.getDay()];
    }

    public getDayWithHighestCounts(data: ResponseDto[]): void {
        this.highestDayCount = data.reduce(function (res, obj) {
            return (obj.comptage > res.comptage) ? obj : res;
        });
        const dayOfWeek = new Date(this.highestDayCount.date);
        this.dayOfWeekWithHighestCounts = this.days[dayOfWeek.getDay()];

    }
    public getAverageOfCounts(data: ResponseDto[]): void {
        let sum = 0;
        data.forEach(elem => {
            sum += elem.comptage;
        });
        this.averageCount = Math.round(sum / data.length);
    }

    public getTotalCounts(data: ResponseDto[]): void {
        let sum = 0;
        data.forEach(elem => {
            sum += elem.comptage;
        });
        this.totalCount = sum;
    }

    public parseDate(date: Date) {
        const dateAsString = JSON.stringify(date);
        return dateAsString.replace(/-/g, '');
    }
}
