import {Component, OnInit} from '@angular/core';
import {PostopStatisticalService} from '../../page-services/postop-statistical.service';
import {GLOBAL} from '../../global';
import {combineLatest} from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-postop-statistical',
  templateUrl: './postop-statistical.component.html',
  styleUrls: ['./postop-statistical.component.css']
})
export class PostopStatisticalComponent implements OnInit {
  tableConfig = {
    data: [],
    load: false,
    actualEnd: null,
    specialtyId: null,
    surgeryId: null,
    doctorId: null,
    status: null,
    pageSize: 10,
    pageIndex: 0,
    totalConfig: {
      total: 0,
      totalFinished: 0,
      totalPostop: 0,
      totalPreop: 0,
      totalRecovery: 0,
      totalIntra: 0
    }
  };

  doctorConfig = {
    data: [],
    load: false,
    name: null,
    pageSize: 10,
    pageIndex: 0,
    totalPage: 0,
  };

  specialtyConfig = {
    data: [],
    load: false,
    name: null,
    pageSize: 10,
    pageIndex: 0,
    totalPage: 0,
  };

  catalogConfig = {
    data: [],
    load: false,
    name: null,
    pageSize: 10,
    pageIndex: 0,
    totalPage: 0,
  };

  constructor(private postOP: PostopStatisticalService) {
  }

  ngOnInit() {
    let array = [];
    array = this.loadTable(array);
    array = this.loadDoctor(array);
    array = this.loadSpeciality(array);
    array = this.loadCatalog(array);
    if (array.length > 0) {
      const result = combineLatest(array);
      result.subscribe((response: any[]) => {
        this.handleTableResponse(response[0]);
        this.handleDoctorResponse(response[1]);
        this.handleSpecialtyReponse(response[2]);
        this.handleCatalogResponse(response[3]);
      });
    }
  }

  loadTable(array?: any) {
    this.tableConfig.load = true;
    const config = Object.assign({}, this.tableConfig);
    if (config.actualEnd) {
      config.actualEnd = moment(config.actualEnd).format('YYYY-MM-DD');
    }
    delete config.data;
    delete config.totalConfig;
    delete config.load;
    const url = GLOBAL.parseUrlString(config);
    if (array) {
      array.push(this.postOP.getPostOpSurgeryShift(url));
      return array;
    }
    this.postOP.getPostOpSurgeryShift(url).subscribe((response) => {
      this.handleTableResponse(response);
    });
  }

  loadDoctor(array?: any) {
    const config = Object.assign({}, this.doctorConfig);
    delete config.data;
    delete config.load;
    delete config.totalPage;
    const url = GLOBAL.parseUrlString(config);
    if (array) {
      array.push(this.postOP.getDoctors(url));
      return array;
    }
    this.postOP.getDoctors(url).subscribe((response) => {
      this.handleDoctorResponse(response);
    });
  }

  loadSpeciality(array?: any) {
    const config = Object.assign({}, this.specialtyConfig);
    delete config.data;
    delete config.load;
    const url = GLOBAL.parseUrlString(config);
    if (array) {
      array.push(this.postOP.getSpecialties(url));
      return array;
    }
    this.postOP.getSpecialties(url).subscribe((response) => {
      this.handleSpecialtyReponse(response);
    });
  }

  loadCatalog(array?: any) {
    const config = Object.assign({}, this.catalogConfig);
    delete config.data;
    delete config.load;
    delete config.totalPage;
    config['specialtyId'] = this.tableConfig.specialtyId;
    const url = GLOBAL.parseUrlString(config);
    if (array) {
      array.push(this.postOP.getCatalogs(url));
      return array;
    }
    this.postOP.getCatalogs(url).subscribe((response) => {
      this.handleCatalogResponse(response);
    });
  }

  handleTableResponse(response) {
    this.tableConfig.load = false;
    this.tableConfig.data = response.results;
    this.tableConfig.totalConfig = {
      total: response.total,
      totalIntra: response.totalIntra,
      totalPostop: response.totalPostop,
      totalPreop: response.totalPreop,
      totalRecovery: response.totalRecovery,
      totalFinished: response.totalFinished,
    };
  }

  handleDoctorResponse(response) {
    this.doctorConfig.load = false;
    if (this.doctorConfig.pageIndex === 0) {
      this.doctorConfig.data = response.doctors;
    } else {
      this.doctorConfig.data = this.doctorConfig.data.concat(response.doctors);
    }
    this.doctorConfig.totalPage = response.totalPage;
  }

  handleSpecialtyReponse(response) {
    this.specialtyConfig.load = false;
    if (this.specialtyConfig.pageIndex === 0) {
      this.specialtyConfig.data = response.specialties;
    } else {
      this.specialtyConfig.data = this.specialtyConfig.data.concat(response.specialties);
    }
    this.specialtyConfig.totalPage = response.totalPage;
  }

  handleCatalogResponse(response) {
    this.catalogConfig.load = false;
    if (this.catalogConfig.pageIndex === 0) {
      this.catalogConfig.data = response.catalogs;
    } else {
      this.catalogConfig.data = this.catalogConfig.data.concat(response.catalogs);
    }
    this.catalogConfig.totalPage = response.totalPage;
  }

  changeDoctorName($event) {
    this.doctorConfig.load = true;
    this.catalogConfig.name = $event;
    this.catalogConfig.pageIndex = 0;
    this.loadDoctor();
  }

  changeSpecialtyName($event) {
    this.specialtyConfig.load = true;
    this.catalogConfig.name = $event;
    this.catalogConfig.pageIndex = 0;
    this.loadSpeciality();
  }

  changeCatalogName($event) {
    this.catalogConfig.name = $event;
    this.catalogConfig.pageIndex = 0;
    this.loadCatalog();
  }

  scrollSpecialtyToBotom() {
    if (this.specialtyConfig.pageIndex < this.specialtyConfig.totalPage) {
      this.specialtyConfig.pageIndex++;
      this.loadSpeciality();
    }
  }

  scrollCatalogToBotom() {
    if (this.catalogConfig.pageIndex < this.catalogConfig.totalPage) {
      this.catalogConfig.pageIndex++;
      this.loadCatalog();
    }
  }

  scrollDoctorToBotom() {
    if (this.doctorConfig.pageIndex < this.doctorConfig.totalPage) {
      this.doctorConfig.pageIndex++;
      this.loadDoctor();
    }
  }

  changePage(e) {
    this.tableConfig.pageIndex = e - 1;
    this.loadTable();
  }
}
