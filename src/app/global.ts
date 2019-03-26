import * as moment from 'moment';
import * as XLSX from 'xlsx';

export const GLOBAL = Object.freeze({
  API: 'https://localhost:44372/api/',
  convertDate: (date: Date) => {
    let dateString = '';
    dateString += date.getFullYear();
    dateString += date.getMonth() >= 10 ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1);
    dateString += date.getDate();
    return dateString;
  },
  parseObject: function (object) {
    let finalData;
    if (typeof object === 'string') {
      finalData = object.trim();
      if (object.indexOf('data:image') !== -1) {
        finalData = object.split(',')[1];
      }
      const numberRex = /^\d{1,3}(,\d{3})*(\.\d+)?$/;
      if (numberRex.test(finalData)) {
        finalData = Number.parseInt(object.replace(/,/g, ''));
      }
      if (this.REGEX_PHONE_NUMBER && this.REGEX_PHONE_NUMBER.test(finalData)) {
        finalData = finalData.replace(/-/g, '');
      }
    } else {
      finalData = Object.assign({}, object);
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          if (object[key] instanceof Array) {
            finalData[key] = this.parseArray(object[key]);
          } else if (object[key] instanceof Date) {
            finalData[key] = moment(object[key]).format('YYYY-MM-DDTHH:mm:ssZ');
          } else if (object[key] instanceof Object) {
            finalData[key] = this.parseObject(object[key]);
          } else if (typeof object[key] === 'string') {
            finalData[key] = this.parseObject(object[key]);
          }
        }
      }
    }
    return finalData;
  },
  copyObject: function (data) {
    return JSON.parse(JSON.stringify(data));
  },
  parseArray: function (bigArray) {
    const finalData = Object.assign([], bigArray);
    for (let i = 0; i < bigArray.length; i++) {
      if (typeof bigArray[i] === 'object') {
        finalData[i] = this.parseObject(bigArray[i]);
      }
    }
    return finalData;
  },
  parseExcelObject: function (data) {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const newKey = key.split(' ').reduce((string, el, i) => {
          el = el.toLowerCase().trim();
          if (i === 0) {
            return string += el;
          } else {
            el = el.charAt(0).toUpperCase() + el.slice(1);
            return string + el;
          }
        }, '');
        data[newKey] = data[key];
        delete data[key];
      }
    }
    return data;
  },
  excelToJson(workbook) {
    const result = [];
    workbook.SheetNames.forEach(function (sheetName) {
      const roa = (XLSX.utils as any).sheet_to_row_object_array(workbook.Sheets[sheetName]);
      if (roa.length > 0) {
        result.push(roa);
      }
    });
    return result;
  },
  readFileExcel: async function (file) {
    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const text = (event.target.result).trim();
        try {
          const data = XLSX.read(text, {
            type: 'binary'
          });
          resolve(this.excelToJson(data).map(el => {
            return el.map(e => {
              return this.parseExcelObject(e);
            });
          }));
        } catch (e) {
          reject(null);
        }
      };
      reader.readAsBinaryString(file);
    });
  },
   parseUrlString: function (data: any) {
    let str = '?';
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== null && data[key] !== '' && data[key] !== undefined) {
                str += key + '=' + data[key] + '&';
            }
        }
    }
    return str.replace(/([&?])$/g, '');
}
});
