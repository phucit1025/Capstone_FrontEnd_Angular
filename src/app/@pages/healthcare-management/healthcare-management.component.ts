import { Component, OnInit } from '@angular/core';
import { PostopService } from 'src/app/page-services/postop.service';
import { FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { GLOBAL } from 'src/app/global';

@Component({
  selector: 'app-healthcare-management',
  templateUrl: './healthcare-management.component.html',
  styleUrls: ['./healthcare-management.component.css']
})
export class HealthcareManagementComponent implements OnInit {
  goodShift : number;
  badShift : number;
  goodHealthcare : number;
  badHealthcare : number;
  state = {
    data: [],
    load: false,
    loadGetHealthcareReport: false,
    visible: false,
    stateId: null, 
  };
  tableConfig = {
    condition : 0,
    date : null,
  }
  selectedCondition = '0';
  careDate : Date;
  selectedConditionHealthcare = '0';
  careDateHealthcare : Date;
  healthcareReportData : any[];

  constructor(private router: Router, private postopSV: PostopService, private fb: FormBuilder, private messageSV: NzMessageService) {
  }

  ngOnInit(){
    this.getHealthcareSurgeryShifts();
  }

  changeTotal(){
    var newData = this.state.data;
    if (this.tableConfig.condition == 1) {
      newData = newData.filter(s => s.woundCondition == 1 && s.drugAllergy == 1);
    }
    if (this.tableConfig.condition == 2) {
      newData = newData.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
    }
    if (this.tableConfig.date) {
      var dateString = GLOBAL.convertDate(this.tableConfig.date);
      newData = newData.filter(s => {
        console.log(GLOBAL.convertDate(new Date(s.closestDate)));
        console.log(dateString);
        console.log(GLOBAL.convertDate(new Date(s.closestDate)).includes(dateString));
        return GLOBAL.convertDate(new Date(s.closestDate)).includes(dateString);
      });
    }
    const badShiftQuantity = newData.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
    this.badShift = badShiftQuantity.length;
    this.goodShift =newData.length - this.badShift;
  }

  changeTotalHealthcare(){
    var newData = this.healthcareReportData;
    if (this.tableConfig.condition == 1) {
      newData = newData.filter(s => s.woundCondition == 1 && s.drugAllergy == 1);
    }
    if (this.tableConfig.condition == 2) {
      newData = newData.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
    }
    if (this.tableConfig.date) {
      var dateString = GLOBAL.convertDate(this.tableConfig.date);
      newData = newData.filter(s => {
        console.log(GLOBAL.convertDate(new Date(s.closestDate)));
        console.log(dateString);
        console.log(GLOBAL.convertDate(new Date(s.closestDate)).includes(dateString));
        return GLOBAL.convertDate(new Date(s.closestDate)).includes(dateString);
      });
    }
    const badShiftQuantity = newData.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
    this.badHealthcare = badShiftQuantity.length;
    this.goodHealthcare =newData.length - this.badHealthcare;
  }

  getHealthcareSurgeryShifts() {
    this.state.load = true;
    this.postopSV.getHealthcareSurgeryShift()
      .subscribe((res: any) => {
          this.state.load = false;
          this.state.data = res;
          const badShiftQuantity = this.state.data.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
          this.badShift = badShiftQuantity.length;
          this.goodShift = this.state.data.length - this.badShift;
        }
      );
    
  }
  
  getHealthcareReport(data) {
    this.state.loadGetHealthcareReport = true;
    this.postopSV.getHealthcareRerpotByShiftId(data.shiftId)
      .subscribe((res: any) => {
          this.state.loadGetHealthcareReport = false;
          this.healthcareReportData = res;
          const badShiftQuantity =  this.healthcareReportData.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
          this.badHealthcare = badShiftQuantity.length;
          this.goodHealthcare =  this.healthcareReportData.length - this.badHealthcare;
        }
      );
    
  }

  redirect(id) {
    this.router.navigate(['pages/schedule-detail', id]);
  }
}
