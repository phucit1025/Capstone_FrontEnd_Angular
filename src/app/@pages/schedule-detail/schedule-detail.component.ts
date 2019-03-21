import { GLOBAL } from './../../global';
import { NzMessageService } from 'ng-zorro-antd';
import { FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ScheduleService } from '../../page-services/schedule.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-schedule-detail',
  templateUrl: './schedule-detail.component.html',
  styleUrls: ['./schedule-detail.component.css']
})
export class ScheduleDetailComponent implements OnInit {
  detailSchedule: any;
  data: any;
  mapOfExpandData: { [key: string]: boolean } = {};
  customeStyle = {
    'background': '#f7f7f7',
    'border-radius': '4px',
    'margin-bottom': '24px',
    'border': '0px'
  };
  state = {
    load: true,
    loadGetSupply: false,
    loadEditSurgery: false,
    loadTreatment: false,
    loadAssignNurse: false,
    loadGetNurse: false,
    loadAllSupply: false,
    loadAllDrug: false,
    loadAllNurse: false,
    loadAddSupply: false,
    loadAddTreatment: false,
    loadSaveProcedure: false,
    editMode: false,
    treatmentMode: null as 'Edit' | 'Create',
    showAddSupply: false,
    showTreatmentReport: false,
    showAssignNurse: false
  };
  surgeryDetail = {
    surgeryProcedure: '',
    containData: '',
    supplyForm: null,
    supplyUsed: []
  };
  treatmentDetail = {
    treatmentReport: [],
    nurseData: null,
    treatmentForm: null,
    assignForm: null,
  };
  common = {
    drugs: [],
    supplies: [],
    nurses: []
  };

  constructor(private message: NzMessageService, private schedule: ScheduleService,
    private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    route.params.subscribe(params => {
      this.getDetail(params.id);
    });
  }

  ngOnInit() {
    this.loadAllDrug();
    this.loadAllSupply();
    this.loadAllNurse();
    this.createNewForm();
  }

  createNewForm() {
    this.surgeryDetail.supplyForm = this.fb.group({
      listSupply: this.fb.array([this.createFormSupply()])
    });
  }

  createNewFormTreatment() {
    this.treatmentDetail.treatmentForm = this.fb.group({
      progressiveDisease: new FormControl(''),
      shiftId: new FormControl(this.data.id),
      treatmentReportDrugs: this.fb.array([this.createFormDrugs()])
    });
  }

  getSupply(id) {
    this.state.loadGetSupply = true;
    this.schedule.getUsedSupply(id).subscribe((supply: any) => {
      this.surgeryDetail.supplyUsed = supply;
      this.state.loadGetSupply = false;
    }, er => {
      this.state.loadGetSupply = false;
    });
  }

  getTreatment(id) {
    this.state.loadTreatment = true;
    this.schedule.getTreatmentReport(id).subscribe((tm: any) => {
      this.treatmentDetail.treatmentReport = tm;
      this.state.loadTreatment = false;
      this.createNewFormTreatment();
    }, er => this.state.loadTreatment = false);
  }

  getNurseByShiftId(id) {
    this.state.loadGetNurse = true;
    this.schedule.getNurseByShiftId(id).subscribe((nurse: any) => {
      this.treatmentDetail.nurseData = nurse.id;
      this.state.loadGetNurse = false;
    }, er => this.state.loadGetNurse = false);
  }

  loadAllNurse() {
    this.state.loadAllNurse = true;
    this.schedule.getAllNurse().subscribe((nurses: any) => {
      this.common.nurses = nurses;
      this.state.loadAllNurse = false;
    }, er => this.state.loadAllNurse = false);
  }

  loadAllSupply() {
    this.state.loadAllSupply = true;
    this.schedule.getAllSupply().subscribe((supplies: any) => {
      this.common.supplies = supplies;
      this.state.loadAllSupply = false;
    }, er => this.state.loadAllSupply = false);
  }

  loadAllDrug() {
    this.state.loadAllDrug = true;
    this.schedule.getAllDrug().subscribe((drugs: any) => {
      this.common.drugs = drugs;
      this.state.loadAllDrug = false;
    }, er => this.state.loadAllDrug = false);
  }

  getEkipMember(id) {
    this.schedule.getEkipMember(id).subscribe(res => {
      this.data.ekipMember = res;
    }, er => {});
  }

  getDetail(id) {
    if (!this.state.load) {
      this.state.load = true;
    }
    this.schedule.getDetailSchedule(id).subscribe((res: any) => {
      this.detailSchedule = res;
      this.state.load = false;
      this.data = res;
      this.getSupply(res.id);
      this.getEkipMember(res.id);
      this.getTreatment(res.id);
      this.getNurseByShiftId(res.id);
      this.surgeryDetail.surgeryProcedure = res.procedure;
      this.surgeryDetail.containData = res.procedure;
    }, er => {
      if (er.status !== 401 || er.status !== 403) {
        this.router.navigate(['pages/error']);
      }
    });
  }

  setUnit(id, index) {
    const data = this.common.drugs.filter(drug => drug.id === id);
    this.treatmentDetail.treatmentForm.get('treatmentReportDrugs').controls[index].controls['unit'].patchValue(id ? data[0].unit : null);
  }

  createFormSupply() {
    return this.fb.group({
      medicalSupplyId: new FormControl('', Validators.required),
      quantity: new FormControl(1, [Validators.required, Validators.min(1)])
    });
  }

  createFormDrugs() {
    return this.fb.group({
      id: new FormControl(0, Validators.required),
      drugId: new FormControl(null, Validators.required),
      morningQuantity: new FormControl(1, [Validators.required, Validators.min(0)]),
      afternoonQuantity: new FormControl(1, [Validators.required, Validators.min(0)]),
      eveningQuantity: new FormControl(1, [Validators.required, Validators.min(0)]),
      nightQuantity: new FormControl(1, [Validators.required, Validators.min(0)]),
      unit: new FormControl(null, Validators.required),
    });
  }

  addFormSupply(): void {
    const array = this.surgeryDetail.supplyForm.get('listSupply') as FormArray;
    array.push(this.createFormSupply());
  }

  addFormDrugs() {
    const array = this.treatmentDetail.treatmentForm.get('treatmentReportDrugs') as FormArray;
    array.push(this.createFormDrugs());
  }

  deleteFormSupply(index: number) {
    const array = this.surgeryDetail.supplyForm.get('listSupply') as FormArray;
    array.removeAt(index);
  }

  deleteFormDrugs(index: number) {
    const array = this.treatmentDetail.treatmentForm.get('treatmentReportDrugs') as FormArray;
    array.removeAt(index);
  }

  submitAddSupplyForm() {
    if (this.surgeryDetail.supplyForm.valid && this.surgeryDetail.supplyForm.value.listSupply.length > 0) {
      this.state.loadAddSupply = true;
      const finalData = this.surgeryDetail.supplyForm.value.listSupply.map(item => {
        item.surgeryShiftId = this.data.id;
        return item;
      });

      this.schedule.addUsedMedicalSupply(finalData).subscribe(res => {
        this.state.loadAddSupply = false;
        this.state.showAddSupply = false;
        this.createNewForm();
        this.getSupply(this.data.id);
        this.message.success('Add Successful');
      }, er => {
        this.state.loadAddSupply = false;
        this.message.error('Add Fail!!!');
      });
    }
  }

  saveSurgeryProcedure() {
    this.state.loadSaveProcedure = true;
    this.schedule.saveSurgeryProcedure({
      procedure: this.surgeryDetail.surgeryProcedure,
      surgeryShiftId: this.data.id
    }).subscribe(res => {
      this.message.success('Save Successful');
      this.state.loadSaveProcedure = false;
      this.state.editMode = false;
      this.surgeryDetail.containData = GLOBAL.copyObject(this.surgeryDetail.surgeryProcedure);
    }, er => {
      this.message.error('Save Fail!!!');
      this.state.loadSaveProcedure = false;
      this.surgeryDetail.surgeryProcedure = GLOBAL.copyObject(this.surgeryDetail.containData);
    });
  }

  saveTreatment() {
    this.state.loadAddTreatment = true;
    const data = this.treatmentDetail.treatmentForm.value;
    this.schedule.createTreatmentReport(data).subscribe(res => {
      this.message.success('Create Successful');
      this.state.showTreatmentReport = false;
      this.state.loadAddTreatment = false;
      this.createNewFormTreatment();
      this.getTreatment(this.data.id);
    }, er => {
      this.message.error('Create Fail!!!');
      this.state.loadAddTreatment = false;
    });
  }

  changeNurse() {
    this.state.loadAssignNurse = true;
    this.schedule.assignNurse(this.data.id, this.treatmentDetail.nurseData).subscribe(res => {
      this.message.success('Assign Successful');
      this.state.loadAssignNurse = false;
      this.state.showAssignNurse = false;
    }, er => {
      this.message.error('Assign Fail!!!');
      this.state.loadAssignNurse = false;
    });
  }
}
