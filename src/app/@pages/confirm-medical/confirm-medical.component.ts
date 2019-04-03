import { NzMessageService } from 'ng-zorro-antd';
import { Component, OnInit } from '@angular/core';
import { ConfirmMedicalService } from '../../page-services/confirm.service';

@Component({
  selector: 'app-confirm-medical',
  templateUrl: './confirm-medical.component.html',
  styleUrls: ['./confirm-medical.component.css']
})
export class ConfirmMedicalComponent implements OnInit {
  listData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  isAllCheck = false;
  state = {
    load: false,
    isShow: false,
  };
  pageIndex = 0;
  supplyList = [];

  constructor(private confirmMedical: ConfirmMedicalService, private message: NzMessageService) {
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.state.load = true;
    this.confirmMedical.getAll().subscribe((list: any) => {
      this.listData = list;
      this.state.load = false;
      console.log(this.listData);
    });
  }

  checkAll(value: boolean): void {
    this.listData.forEach(item => this.mapOfCheckedId[item.id] = value);
    this.checkItem();
  }

  checkItem() {
    this.isAllCheck = this.listData.every(item => this.mapOfCheckedId[item.id]);
  }

  getCheckedItem() {
    return this.listData.filter(item => this.mapOfCheckedId[item.id] === true);
  }

  getUnCheckedItem() {
    return this.listData.filter(item => !(this.mapOfCheckedId[item.id] === true));
  }

  isActive() {
    return this.getCheckedItem().length > 0;
  }

  confirm() {
    if (this.isActive()) {
      const data = this.getCheckedItem().map(el => {
        return { id: el.id };
      });
      if (data && data.length > 0) {
        this.state.load = true;
        // Call Api
        this.confirmMedical.confirmMedicalRequest(data).subscribe(res => {
          this.listData = this.getUnCheckedItem();
          this.mapOfCheckedId = {};
          this.state.load = false;
          this.message.success('Confirm Success');
          this.confirmMedical.makeScheduleList().subscribe(mRes => {
          });
        }, er => {
          this.state.load = false;
          this.message.error('Confirm Fail!!!');
        });
      }
    }
  }
  createSupplyList(data){
    this.supplyList = data.medicalSupplies;
  }
}
