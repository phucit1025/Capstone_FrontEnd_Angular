import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'conditionPipe'
})
export class ConditionPipe implements PipeTransform {

  transform(array: any, condition: string): any {
    if (condition) {
      if (condition == '1') {
        console.log(1);
        return array.filter(s => s.woundCondition == 1 && s.drugAllergy == 1);
      }
      if (condition == '2') {
        console.log(2);
        return array.filter(s => s.woundCondition == 2 || s.drugAllergy == 2);
      }
      return array;
    }
  }

}
