import { Pipe, PipeTransform } from '@angular/core';
import { filter } from 'rxjs/operators';

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
              el.slotRooms.forEach((slot, k) => {
                newData[i].slotRooms[k].surgeries = slot.surgeries.filter(sg => sg.id.toString().includes(t.trim()));
              });
            } else {
              if (t !== idList[0]) {
                el.slotRooms.forEach((slot, k) => {
                  const result = slot.surgeries.filter(sg => sg.id.toString().includes(t.trim()));
                  newData[i].slotRooms[k].surgeries = newData[i].slotRooms[k].surgeries.concat(result).unique();
                });
              }
            }
          });
        }
      });
      const finalSearch = newData.map(room => {
         room.slotRooms = room.slotRooms.filter(slot => slot.surgeries.length > 0);
         return room;
      }).filter(room => room.slotRooms.length > 0);
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
