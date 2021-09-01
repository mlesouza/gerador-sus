class CSV {
  convertToCSV(obj: Object) {
    let array = typeof obj != 'object' ? JSON.parse(obj) : obj;
    let str = '';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in array[i]) {
        if (line !== '') {
          line += ',';
        }
        line += array[i][index];
      }
      str += line + '\r\n';
    }
    return str;
  }

  exportCSVFile(headers: any, items: any, fileTitle: string) {
    if (headers) {
      items.unshift(headers);
    }

    let jsonObject = JSON.stringify(items);
    let csv = this.convertToCSV(jsonObject);
    let exportedFilename = fileTitle + '.csv' || 'arquivo-sus-filtrado.csv';

    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    let link = document.createElement('a');
    if (link.download !== undefined) {
      let url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportedFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

export default new CSV();
