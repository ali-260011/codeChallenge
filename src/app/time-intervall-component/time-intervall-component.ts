import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartOptions } from 'chart.js';
import { DatePipe } from '@angular/common';

export interface ResponseDto {
    date?: Date | string;
    comptage?: number;
    timestamp?: number;
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
    chartData: any = [];
    errorMessage = '';

    constructor(private httpClient: HttpClient, private datePipe: DatePipe) {
    }


    showResult() {
        const begin = this.parseDate(this.startDate)
        const end = this.parseDate(this.endDate);
        const invalidUrl = 'http://www.eco-public.com/api/cw6Xk4jW4X4R/data/periode/102032236/?begin='
            + begin + '&end=' + end + '&step=4';
        const requestUrl = invalidUrl.replace(/"/g, '');
        this.httpClient.get(requestUrl).subscribe((result: ResponseDto[]) => {
            if (result.length > 0) {
                this.responseToDisplay = result;
                this.chartData = [];
                this.getDayWithLeastCounts(this.responseToDisplay);
                this.getDayWithHighestCounts(this.responseToDisplay);
                this.getAverageOfCounts(this.responseToDisplay);
                this.getTotalCounts(this.responseToDisplay);
                this.leastDayCount['unique'] = true;
                this.leastDayCount['label'] = 'Least count';
                this.highestDayCount['unique'] = true;
                this.highestDayCount['label'] = 'Highest count';
                this.responseToDisplay.push(this.convertNumberToObjectToDisplay(this.totalCount, 'Total'));
                this.responseToDisplay.push(this.convertNumberToObjectToDisplay(this.averageCount, 'Average'));
                this.options = this.initializeChartOptions();
                this.chartData = this.initializeChartDatasets(this.responseToDisplay);
                this.displayLineChart();
            } else {
                //TODO: corner case where backend returns null.
                this.errorMessage = 'No Data found on this date';
                console.log('there are no data found');
            }
        },
            (err) => { console.log('Error occured while loading data') },
            () => { });
    }

    public convertNumberToObjectToDisplay(number: number, label: string) {
        return {
            comptage: number,
            unique: true,
            date: Date(),
            label: label
        } as ResponseDto;
    }

    public displayLineChart() {
        var ch = new Chart('chart', {
            type: 'line',
            data: this.chartData,
            options: this.options
        })
    }

    public checkDateValidation() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            this.invalidDate = true;
            this.errorMessage = 'The end date should be after the start date';
        }
        else {
            this.invalidDate = false;
            this.errorMessage = '';
        }
    }
    public initializeChartDatasets(responseData: ResponseDto[]) {
        return {
            labels: responseData.map(e => {
                if (e['unique'] && e['label']) {
                    return this.datePipe.transform(e.date, 'dd-MM-yyyy') + e['label']
                } else { return this.datePipe.transform(e.date, 'dd-MM-yyyy') }
            }),
            datasets: [{
                data: responseData.map(e => e.comptage),
                backgroundColor: responseData.map(e => e['unique'] ? 'red' : 'green'),
                borderColor: 'blue',
                borderWidth: 1,
                fill: false
            }]
        }
    }

    public initializeChartOptions(): any {
        return {
            responsive: true,
            showLines: true,
            legend: {
                display: false
            }
        }
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
