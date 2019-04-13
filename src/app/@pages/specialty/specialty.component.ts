import { Component, OnInit, ViewChild } from '@angular/core';
import { SpecialtyService } from 'src/app/page-services/specialty.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { SwalComponent } from '@toverux/ngx-sweetalert2';

@Component({
  selector: 'app-specialty',
  templateUrl: './specialty.component.html',
  styleUrls: ['./specialty.component.css']
})
export class SpecialtyComponent implements OnInit {
  @ViewChild('createErrorSwal') createErrorSwal: SwalComponent;

  loadingId: any;
  isShowAddMoreModal = false;
  isShowCreateModal = false;
  state = {
    load: false,
    finish: false,
  };

  specialtyGroups: any[];
  selectedGroupId: number;
  selectedSpecialties: any;
  selectedSpecialtyGroupName = '';
  optionList: any[];
  allSpecialtyList: any[];
  filteredSpecialtyList: any[];
  groupSpecialtyList: any[];

  creatingObject: string;
  objectName: string;

  errorMsg: string;

  constructor(
    private specialty: SpecialtyService
  ) { }

  ngOnInit() {
    this.getSpecialityGroups();
  }

  getSpecialties(callback: any) {
    this.state.load = true;
    this.specialty.getSpecialties().subscribe((response: any[]) => {
      console.log(response);
      this.allSpecialtyList = response;
      this.state.load = false;
      this.state.finish = true;
      callback();
    });
  }

  getSpecialityGroups() {
    this.state.load = true;
    this.specialty.getSpecialtyGroups().subscribe((response: any[]) => {
      console.log(response);
      this.specialtyGroups = response;
      this.state.load = false;
      this.state.finish = true;
    });
  }

  openAddMoreModal(groupId: number) {
    this.selectedSpecialties = [];
    this.getSpecialties(() => {
      this.selectedGroupId = groupId;
      this.isShowAddMoreModal = true;
      this.filteredSpecialtyList = this.allSpecialtyList.filter(e => e.groupId !== this.selectedGroupId);
      this.selectSpecialtyGroup(groupId);
    });
  }

  selectSpecialtyGroup(groupId: number) {
    this.getSpecialties(() => {
      this.selectedGroupId = groupId;
      this.groupSpecialtyList = this.allSpecialtyList.filter(e => e.groupId === this.selectedGroupId);
    });
  }

  setSpecialtyToGroup() {
    const group = {
      specialtyGroupId: this.selectedGroupId,
      specialtyId: this.selectedSpecialties
    };
    this.specialty.setSpecialtyToGroup(group).subscribe(() => {
      this.selectSpecialtyGroup(this.selectedGroupId);
    });
  }

  createObject() {
    switch (this.creatingObject) {
      case 'Specialty Group':
        this.specialty.createSpecialtyGroup({ name: this.objectName }).toPromise()
          .then(
            () => {
              this.isShowCreateModal = false;
              this.getSpecialityGroups();
            },
            error => {
              this.errorMsg = error.error.message;
              this.createErrorSwal.show();
            }
          );
        break;
      case 'Specialty':
        this.specialty.createSpecialty({ name: this.objectName }).toPromise()
        .then(
          () => {
            this.isShowCreateModal = false;
          },
          error => {
            this.errorMsg = error.error.message;
            this.createErrorSwal.show();
          }
        );
        break;
    }
  }

}
