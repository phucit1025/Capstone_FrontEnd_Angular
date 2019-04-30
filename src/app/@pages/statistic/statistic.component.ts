import { Component, OnInit } from '@angular/core';
import * as CanvasJS from '../../../assets/canvasjs.min';
import { ScheduleService } from 'src/app/page-services/schedule.service';
import { NzMessageService } from 'ng-zorro-antd';
import {GLOBAL} from '../../global';

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.css']
})
export class StatisticComponent implements OnInit {

  startDate: Date;
  endDate: Date;

  constructor(
    private schedule: ScheduleService,
    private message: NzMessageService,) {
  }

  ngOnInit() {
    this.startDate = new Date();
    this.endDate = new Date();

    this.getSumSurgeriesSpec();
    this.getEfficientcyRoom();
  }

  refresh(){
    this.getSumSurgeriesSpec();
    this.getEfficientcyRoom();
  }

  getSumSurgeriesSpec(){
      this.schedule.getNumShiftBySpec(GLOBAL.convertDateFormat(this.startDate), GLOBAL.convertDateFormat(this.endDate)).subscribe(data => {
        let rs =  data.map(item => ({
          y: item.number,
          label: item.specialtyName,
        }));
        let chart = new CanvasJS.Chart("chartContainer", {
          animationEnabled: true,
          exportEnabled: true,
          title: {
            text: "Sum Of Surgeries By Specialty"
          },
          data: [{
            type: "column",
            dataPoints: rs,
          }]
        });
        chart.render();
      }, er => {
        this.message.error('Create Fail!!!');
      });
  }

  getEfficientcyRoom(){
    this.schedule.getEfficientcyRoom(GLOBAL.convertDateFormat(this.startDate), GLOBAL.convertDateFormat(this.endDate)).subscribe(data => {
      let rs =  data.map(item => ({
        y: item.number,
        label: item.roomName,
      }));
      let chart = new CanvasJS.Chart("chartContainer1", {
        animationEnabled: true,
        exportEnabled: true,
        title: {
          text: "Surgery Roome Efficiency"
        },
        data: [{
          type: "column",
          dataPoints: rs,
        }]
      });
      chart.render();
    }, er => {
      this.message.error('Create Fail!!!');
    });
}

}
