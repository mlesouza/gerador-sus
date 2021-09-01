/* eslint-disable guard-for-in */
import React, { useState } from 'react';
import {
  Upload,
  message,
  PageHeader,
  Spin,
  Button,
  Table,
  Result,
  Select,
  Card,
  Form,
  Tooltip,
} from 'antd';
import {
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  InboxOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import XLSX from 'xlsx';
import UploadTemplate from '../../templates/Upload';
import { ButtonContainer, FilteredButtons, TableWrapper } from './styled';
import csv from '../../services/csv';

const { Dragger } = Upload;
const { Option } = Select;

interface ColumnsProps {
  title: string;
  dataIndex: string;
  key: string;
}

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<XLSX.WorkSheet>({});
  const [csvFile, setCsvFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [filtredLoading, setFiltredLoading] = useState(false);

  const [showTable, setShowTable] = useState(false);
  const [columnsTable, setColumnsTable] = useState<ColumnsProps[]>([]);
  const [columnsTableFiltred, setColumnsTableFiltred] = useState<
    ColumnsProps[]
  >([]);
  const [selectChildren, setSelectChildren] = useState<React.ReactNode>([]);
  const [dataSource, setDataSource] = useState<any>([]);
  const [columnsForCSV, setColumnsForCSV] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const draggerProps = {
    multiple: false,
    accept: '.dbf, .dbc',
    progress: { strokeWidth: 2, showInfo: true },
    onChange(info: any) {
      const { status } = info.file;
      setLoading(true);
      if (status === 'done') {
        const work = XLSX.readFile(info.file.originFileObj.path).Sheets;
        setFile(work.Sheet1);
        setCsvFile(XLSX.utils.sheet_to_csv(work.Sheet1));
        setLoading(false);
        message.success(`${info.file.name} carregado com sucesso.`);
        gerarTabela(work.Sheet1);
        gerarSelecaoDeColunas(work.Sheet1);
      } else if (status === 'error') {
        message.error(`não foi possivel carregar o arquivo ${info.file.name}.`);
      } else if (status === 'removed') {
        setFile({});
        setCsvFile('');
        setLoading(false);
        setShowTable(false);
        setShowFilters(false);
        setColumnsTable([]);
        setDataSource([]);
      }
    },
    maxCount: 1,
  };

  const gerarSelecaoDeColunas = (_file: any) => {
    setLoading(true);
    const json: any = XLSX.utils.sheet_to_json(_file, {
      header: 'A',
    });
    const columnsJson = json[0];
    const array = [];
    for (let prop in columnsJson) {
      array.push(
        <Option key={prop} value={prop}>
          {columnsJson[prop]}
        </Option>
      );
    }
    setSelectChildren(array);
    setLoading(false);
  };

  const gerarTabela = (_file: any) => {
    setLoading(true);
    const json: any = XLSX.utils.sheet_to_json(_file, {
      header: 'A',
    });
    const columnsJson = json[0];
    json.shift();
    setDataSource(json);
    let columns = [];
    for (let prop in columnsJson) {
      columns.push({
        title: columnsJson[prop],
        dataIndex: prop,
        key: prop,
      });
    }
    setColumnsTable(columns);
    setLoading(false);
  };

  const gerarCsv = () => {
    setLoading(true);
    let hiddenElement = document.createElement('a');
    hiddenElement.href =
      'data:text/csv;charset=utf-8,' + encodeURI(XLSX.utils.sheet_to_csv(file));
    hiddenElement.target = '_blank';

    hiddenElement.download = 'gerador-sus.csv';
    hiddenElement.click();
    setLoading(false);
  };

  const gerarJSON = () => {
    let hiddenElement = document.createElement('a');
    let json: string = JSON.stringify(XLSX.utils.sheet_to_json(file));
    hiddenElement.href = 'data:text/json;charset=utf-8,' + encodeURI(json);
    hiddenElement.target = '_blank';

    hiddenElement.download = 'gerador-sus.json';
    hiddenElement.click();
  };

  const onChangeSelect = (value: any) => {
    setColumnsForCSV(value);

    // console.log(value);
    // const json: any[] = XLSX.utils.sheet_to_json(file, {
    //   header: 'A',
    // });
    // json.shift();
    // json.map((item) => {
    //   let newItem: any = {};
    //   for (let prop of value) {
    //     newItem[prop] = item[prop];
    //   }
    //   console.log(newItem);
    // });
  };

  const generateFiltredTable = () => {
    setFiltredLoading(true);
    const json: any[] = XLSX.utils.sheet_to_json(file, {
      header: 'A',
    });
    const columnsJson = json[0];
    json.shift();

    let columns = [];
    for (let prop in columnsJson) {
      const filtred = columnsForCSV.filter((item) => prop === item);
      if (filtred.length > 0) {
        columns.push({
          title: columnsJson[prop],
          dataIndex: prop,
          key: prop,
        });
      }
    }
    setColumnsTableFiltred(columns);
    setFiltredLoading(false);
  };

  const generateFiltredCSV = () => {
    const json: any[] = XLSX.utils.sheet_to_json(file, {
      header: 'A',
    });
    const columnsJson = json[0];
    json.shift();

    let header: any = {};
    for (let prop in columnsJson) {
      let filtered = columnsForCSV.filter((item) => prop === item);
      if (filtered.length > 0) {
        header[prop] = columnsJson[prop];
      }
    }
    // console.log(header, json, columnsForCSV);
    let itens = [];
    let rows = json.map((item) => {
      let obj: any = {};
      for (let prop in header) {
        obj[prop] = item[prop];
      }
      return obj;
    });
    csv.exportCSVFile(header, rows, 'gerador-sus-filtrado');
  };

  return (
    <Spin
      spinning={loading}
      tip="Carregando"
      size="large"
      style={{ minHeight: '100vh' }}
    >
      <UploadTemplate>
        <PageHeader
          title="Upload"
          subTitle="Upload de arquivos do SUS"
          style={{ padding: '16px 0' }}
        />
        <Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Clique ou arraste um arquivo para fazer o upload.
          </p>
          <p className="ant-upload-hint">
            O sistema suporta apenas uploads únicos e de arquivos no formato
            DBC.
          </p>
        </Dragger>
        {csvFile !== '' ? (
          <ButtonContainer bordered={true} title="Opções">
            <Button
              type="default"
              icon={<FilterOutlined />}
              onClick={() => {
                setShowFilters(!showFilters);
                setShowTable(false);
                setColumnsTableFiltred([]);
                setColumnsForCSV([]);
              }}
            >
              Mostrar Filtros
            </Button>
            <Button
              type="default"
              icon={<EyeOutlined />}
              onClick={() => {
                setShowTable(!showTable);
                setShowFilters(false);
                setColumnsTableFiltred([]);
                setColumnsForCSV([]);
              }}
            >
              Visualizar dados originais
            </Button>
            {/* <Button type="default" onClick={gerarJSON}>
              Download JSON
            </Button> */}
            <Button
              icon={<DownloadOutlined />}
              type="default"
              onClick={gerarCsv}
            >
              Download CSV
            </Button>
          </ButtonContainer>
        ) : null}
        {showFilters ? (
          <Card bordered={true} title="Filtrar dados">
            <Form layout="vertical">
              <Form.Item
                label={
                  <div>
                    <label>Seleciona as colunas desejadas</label>

                    <Tooltip
                      placement="top"
                      title="A ordem escolhida ao selecionar as colunas será aplicada ao arquivo"
                    >
                      <InfoCircleOutlined style={{ marginLeft: '5px' }} />
                    </Tooltip>
                  </div>
                }
              >
                <Select
                  allowClear={true}
                  onClear={() => setColumnsTableFiltred([])}
                  mode="multiple"
                  placeholder="Selecione os campos que deseja trabalhar."
                  style={{ width: '100%' }}
                  onChange={onChangeSelect}
                >
                  {selectChildren}
                </Select>
              </Form.Item>
              <FilteredButtons>
                <Button
                  icon={<EyeOutlined />}
                  type="default"
                  onClick={generateFiltredTable}
                  disabled={columnsForCSV.length === 0}
                >
                  Visualizar dados filtrados
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  type="default"
                  disabled={columnsForCSV.length === 0}
                  onClick={generateFiltredCSV}
                >
                  Gerar CSV dados filtrados
                </Button>
              </FilteredButtons>
            </Form>
          </Card>
        ) : null}

        {columnsTableFiltred.length > 0 ? (
          <Spin spinning={filtredLoading}>
            <Card
              style={{ margin: '20px 0' }}
              title="Visualização dos dados filtrados"
              bordered={true}
            >
              <TableWrapper>
                <Table
                  dataSource={dataSource}
                  columns={columnsTableFiltred}
                  loading={filtredLoading}
                />
              </TableWrapper>
            </Card>
          </Spin>
        ) : null}

        {dataSource.length > 0 && showTable ? (
          <Card
            title="Visualização dos dados originais"
            bordered={true}
            style={{ margin: '20px 0' }}
          >
            <TableWrapper>
              <Table dataSource={dataSource} columns={columnsTable} />
            </TableWrapper>
          </Card>
        ) : null}
      </UploadTemplate>
    </Spin>
  );
};

export default UploadPage;
