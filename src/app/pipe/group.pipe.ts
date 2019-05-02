import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'groupPipe'
})
export class GroupPipe implements PipeTransform {

  transform(array: any, checkboxs?: any): any {
    if (checkboxs && checkboxs.length > 0) {
      let newData = JSON.parse(JSON.stringify(array));
      newData = newData.filter(el => checkboxs.indexOf(el.specialtyGroupId) !== -1);
      return newData;
    }
    return array;
  }
}
