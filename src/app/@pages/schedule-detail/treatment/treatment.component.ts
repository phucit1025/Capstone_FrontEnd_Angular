import {NzMessageService} from 'ng-zorro-antd';
import {FormBuilder, FormControl, Validators, FormArray} from '@angular/forms';
import {Component, OnInit, Input} from '@angular/core';
import {ScheduleService} from './../../../page-services/schedule.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.css']
})
export class TreatmentComponent implements OnInit {
  @Input() id: number;
  @Input() data: any;
  mapOfExpandData: { [key: string]: boolean } = {};
  state = {
    loadTreatment: false,
    loadAddTreatment: false,
    treatmentMode: null as 'Edit' | 'Create',
    showTreatmentReport: false,
    loadAssignNurse: false,
    loadGetNurse: false,
    loadAllNurse: false,
    showAssignNurse: false,
    assignedForNurse: false,
  };
  treatmentDetail = {
    treatmentReport: [],
    nurse : null,
    nurseData: null,
    treatmentForm: null,
    assignForm: null,
  };
  drugs: Array<{ id: number; name: string; unit: string }> = [];
  common = {
    nurses: []
  };
  customeStyle = {
    'background': '#f7f7f7',
    'border-radius': '4px',
    'margin-bottom': '24px',
    'border': '0px'
  };

  constructor(private message: NzMessageService, private schedule: ScheduleService,
              private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
  }

  ngOnInit() {
  }

  trackByFn(index, item) {
    return item ? item.id : undefined;
  }

  nzFilterOption = () => true;

  searchDrug(value: string): void {
    value.trim();
    if (value != '') {
      this.schedule.searchDrug(value)
        .subscribe(data => {
          console.log(data);
          this.drugs = data.map(item => ({
            id: item.id,
            name: item.name,
            unit: item.unit,
          }));
          this.drugs = [...this.drugs];
          console.log(this.drugs);
        }, er => console.log(er));

    }
  }

  loadAllNurse() {
    this.state.loadAllNurse = true;
    this.schedule.getAllNurse().subscribe((nurses: any) => {
      this.common.nurses = nurses;
      this.state.loadAllNurse = false;
    }, er => this.state.loadAllNurse = false);
  }

  createNewFormTreatment() {
    this.treatmentDetail.treatmentForm = this.fb.group({
      progressiveDisease: new FormControl(''),
      shiftId: new FormControl(this.data.id),
      treatmentReportDrugs: this.fb.array([this.createFormDrugs()])
    });
    this.state.treatmentMode = 'Create';
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
      this.treatmentDetail.nurse = nurse;
      this.treatmentDetail.nurseData = nurse.id;
      this.state.loadGetNurse = false;
      this.state.assignedForNurse = true;
    }, er => this.state.loadGetNurse = false);
  }

  setUnit(id, index) {
    const data = this.drugs.filter(drug => drug.id === id);
    this.treatmentDetail.treatmentForm.get('treatmentReportDrugs').controls[index].controls['unit'].patchValue(id ? data[0].unit : null);
  }

  addFormDrugs() {
    const array = this.treatmentDetail.treatmentForm.get('treatmentReportDrugs') as FormArray;
    array.push(this.createFormDrugs());
  }

  deleteFormDrugs(index: number) {
    const array = this.treatmentDetail.treatmentForm.get('treatmentReportDrugs') as FormArray;
    array.removeAt(index);
  }

  saveTreatment() {
    this.state.loadAddTreatment = true;
    const data = this.treatmentDetail.treatmentForm.value;
    if (this.state.treatmentMode === 'Create') {
      this.schedule.createTreatmentReport(data).subscribe(res => {
        this.message.success('Create Successful');
        this.state.showTreatmentReport = false;
        this.state.loadAddTreatment = false;
        this.createNewFormTreatment();
        this.getTreatment(this.id);
      }, er => {
        this.message.error('Create Fail!!!');
        this.state.loadAddTreatment = false;
      });
    } else if (this.state.treatmentMode === 'Edit') {
      console.log(data);
      this.schedule.editTreatmentReport(data).subscribe(res => {
        this.message.success('Edit Successful');
        this.state.showTreatmentReport = false;
        this.state.loadAddTreatment = false;
        this.createNewFormTreatment();
        this.getTreatment(this.id);
      }, er => {
        this.message.error('Edit Fail!!!');
        this.state.loadAddTreatment = false;
      });
    }
  }

  changeNurse() {
    this.state.loadAssignNurse = true;
    this.schedule.assignNurse(this.data.id, this.treatmentDetail.nurseData).subscribe(res => {
      this.message.success('Assign Successful');
      this.state.loadAssignNurse = false;
      this.state.showAssignNurse = false;
      this.state.assignedForNurse = true;
      this.getNurseByShiftId(this.data.id);
    }, er => {
      this.message.error('Assign Fail!!!');
      this.state.loadAssignNurse = false;
    });
  }

  deleteTreatment(id) {
    this.state.loadAddTreatment = true;
    this.schedule.deleteTreatmentReport(id).subscribe(() => {
      this.state.showTreatmentReport = false;
      this.state.loadAddTreatment = false;
      this.message.success('Delete Successful');
      this.getTreatment(this.id);
    }, er => {
      this.message.error('Delete Fail');
      this.state.loadAddTreatment = false;
    });
  }

  createEditFormTreatment(data) {
    console.log(data);
    this.treatmentDetail.treatmentForm = this.fb.group({
      id: new FormControl(data.id),
      progressiveDisease: new FormControl(data.progressiveDisease),
      shiftId: new FormControl(this.id),
      treatmentReportDrugs: this.fb.array([]),
      deleteTreatmentReportId: this.fb.array([]),
    });
    this.patchFormDrugArray(data.treatmentReportDrugs);
    this.state.showTreatmentReport = true;
    this.state.treatmentMode = 'Edit';
  }

  pushDeleteTreatmentReportId(id) {
    console.log(id);
    if (this.state.treatmentMode === 'Edit') {
      let ctrl = this.treatmentDetail.treatmentForm.controls.deleteTreatmentReportId;
      ctrl.push(new FormControl(id));
    }
  }

  patchFormDrugArray(data) {
    let drugs = data.map(d => ({
      id: d.drugId,
      name: d.name,
      unit: d.unit
    }));
    this.drugs = drugs;
    let ctrl = this.treatmentDetail.treatmentForm.controls.treatmentReportDrugs;
    return data.map(x => {
      ctrl.push(this.fb.group({
        id: new FormControl(x.id, Validators.required),
        drugId: new FormControl(x.drugId, Validators.required),
        morningQuantity: new FormControl(x.morningQuantity, [Validators.required, Validators.min(0)]),
        afternoonQuantity: new FormControl(x.afternoonQuantity, [Validators.required, Validators.min(0)]),
        eveningQuantity: new FormControl(x.eveningQuantity, [Validators.required, Validators.min(0)]),
        nightQuantity: new FormControl(x.nightQuantity, [Validators.required, Validators.min(0)]),
        unit: new FormControl(x.unit, Validators.required),
      }));
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
}
