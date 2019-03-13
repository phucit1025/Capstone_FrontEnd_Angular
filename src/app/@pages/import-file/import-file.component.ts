import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {NzMessageService} from 'ng-zorro-antd';
import * as XLSX from 'node_modules/xlsx';

@Component({
  selector: 'app-import-file',
  templateUrl: './import-file.component.html',
  styleUrls: ['./import-file.component.css']
})
export class ImportFileComponent implements OnInit {
  @ViewChild('file') file: ElementRef;
  state = {
    load: false
  };
  data: any;

  constructor(private message: NzMessageService) {
  }

  ngOnInit() {
  }

  handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      this.state.load = true;
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const text = (event.target.result).trim();
        try {
          const data = XLSX.read(text, {
            type: 'binary'
          });
          this.data = this.toJson(data)[0].map((el, i) => {
            el.index = i;
            return el;
          });
          this.state.load = false;
          this.message.success('File parse successfully');
        } catch (e) {
          this.state.load = false;
          this.message.error('File input is not valid');
        }
      };
      reader.readAsBinaryString(file);
    }
  }

  toJson(workbook) {
    const result = [];
    workbook.SheetNames.forEach(function (sheetName) {
      const roa = (XLSX.utils as any).sheet_to_row_object_array(workbook.Sheets[sheetName]);
      if (roa.length > 0) {
        result.push(roa);
      }
    });
    return result;
  }

  clearResult() {
    if (this.file) {
      this.file.nativeElement.value = null;
    }
    this.data = [];
  }
}
