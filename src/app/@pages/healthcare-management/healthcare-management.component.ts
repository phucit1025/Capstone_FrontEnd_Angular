import { Component, OnInit } from '@angular/core';
import { PostopService } from 'src/app/page-services/postop.service';
import { FormBuilder } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';

@Component({
  selector: 'app-healthcare-management',
  templateUrl: './healthcare-management.component.html',
  styleUrls: ['./healthcare-management.component.css']
})
export class HealthcareManagementComponent implements OnInit {
  goodShift : number;
  badShift : number;
  state = {
    data: [],
    load: false,
    visible: false,
    stateId: null, 
  };
  selectedCondition = '0';

  constructor(private router: Router, private postopSV: PostopService, private fb: FormBuilder, private messageSV: NzMessageService) {
  }

  ngOnInit(){
    this.getHealthcareSurgeryShifts();
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

  redirect(id) {
    this.router.navigate(['pages/schedule-detail', id]);
  }
}
