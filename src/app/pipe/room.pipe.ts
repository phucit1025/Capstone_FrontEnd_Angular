import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'roomPipe'
})
export class RoomPipe implements PipeTransform {

  transform(array: any, search: string): any {
    if (search) {
      const idList = search.split(',');
      const newData = JSON.parse(JSON.stringify(array));
      idList.forEach((t, j) => {
        if (t.trim()) {
          array.map((el, i) => {
            if (j === 0) {
              newData[i].surgery = el.surgery.filter(sg => sg.id.toString().includes(t.trim()));
            } else {
              const result = el.surgery.filter(sg => sg.id.toString().includes(t.trim()));
              newData[i].surgery = newData[i].surgery.concat(result).unique();
            }
          });
        }
      });
      const finalSearch = newData.filter(el => el.surgery.length > 0);
      return finalSearch.length > 0 ? finalSearch : [-1];
    }
    return array;
  }

}

interface Array {
  unique(): any[];
}

// @ts-ignore
Array.prototype.unique = function () {
  const a = this.concat();
  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i] === a[j]) {
        a.splice(j--, 1);
      }
    }
  }
  return a;
};
