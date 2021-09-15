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
import Parser from 'node-dbf';
import { parse } from 'path';
import Item from 'antd/lib/list/Item';

const { Dragger } = Upload;
const { Option } = Select;

interface ColumnsProps {
  title: string;
  dataIndex: string;
  key: string;
}

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<XLSX.WorkSheet>({});
  const [fileHeader, setFileHeader] = useState([]);
  const [fileBody, setFileBody] = useState([]);
  const [csvFile, setCsvFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [filtredLoading, setFiltredLoading] = useState(false);

  const [showTable, setShowTable] = useState(true);
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
    accept: '.dbf',
    progress: { strokeWidth: 2, showInfo: true },
    onChange(info: any) {
      const { status } = info.file;
      setLoading(true);
      console.log('Iniciou');
      if (status === 'done') {
        let parser = new Parser(info.file.originFileObj.path);
        let headers: any = [];
        let body: any = [];

        parser.on('start', (p: any) => {
          console.log('dBase file parsing has started');
        });

        parser.on('header', (h: any) => {
          h.fields.map((item: any) => {
            headers.push(item.name);
          });
        });

        parser.on('record', (record: any) => {
          body.push(record);
        });

        parser.on('end', (p: any) => {
          setFileHeader(headers);
          setFileBody(body);
          gerarTabela(headers, body);
          gerarSelecaoDeColunas(headers);
          setLoading(false);
        });
        console.log(parser.parse());

        // const readable = createReadStream(info.file.originFileObj.path);
        // let buffers: any = [];
        // readable.on('data', function (data) {
        //   buffers.push(data);
        // });
        // readable.on('end', () => {
        //   let buffer = Buffer.concat(buffers);
        //   const work = XLSX.read(buffer, {
        //     type: 'buffer',
        //   }).Sheets;
        //   console.log(work);
        //   setFile(work.Sheet1);
        //   setCsvFile(XLSX.utils.sheet_to_csv(work.Sheet1));
        //   setLoading(false);
        //   message.success(`${info.file.name} carregado com sucesso.`);
        //   gerarTabela(work.Sheet1);
        //   gerarSelecaoDeColunas(work.Sheet1);
        // });
      } else if (status === 'error') {
        message.error(`não foi possivel carregar o arquivo ${info.file.name}.`);
      } else if (status === 'removed') {
        setFile({});
        setFileBody([]);
        setFileHeader([]);
        setLoading(false);
        setShowTable(false);
        setShowFilters(false);
        setColumnsTable([]);
        setDataSource([]);
      }
    },
    maxCount: 1,
  };

  const gerarSelecaoDeColunas = (_header: any) => {
    setLoading(true);
    const array: any = [];
    _header.map((item: any) => {
      array.push(
        <Option key={item} value={item}>
          {item}
        </Option>
      );
    });
    setSelectChildren(array);
    setLoading(false);
  };

  const gerarTabela = (_header: any, _body: any) => {
    console.log('entrou');
    setLoading(true);
    let columns: any = [];
    _header.map((item: any) => {
      columns.push({
        title: item,
        dataIndex: item,
        key: item,
      });
    });
    setColumnsTable(columns);
    setDataSource(_body);
    setLoading(false);
  };

  const onChangeSelect = (value: any) => {
    setColumnsForCSV(value);
  };

  const generateFiltredTable = () => {
    setFiltredLoading(true);
    let columns: any = [];
    columnsForCSV.map((item) => {
      columns.push({ title: item, dataIndex: item, key: item });
    });
    setColumnsTableFiltred(columns);
    setFiltredLoading(false);
  };

  const gerarCsv = () => {
    setLoading(true);
    let header: any = {};
    fileHeader.map((item) => {
      header[item] = item;
    });
    let body: any = [];
    body = fileBody.map((item) => {
      delete item['@deleted'];
      delete item['@sequenceNumber'];
      return item;
    });
    csv.exportCSVFile(header, body, 'gerador-sus');
    setLoading(false);
  };

  const generateFiltredCSV = () => {
    let header: any = {};

    fileHeader.map((item) => {
      let filtered = columnsForCSV.filter((column) => column === item);
      if (filtered.length > 0) {
        header[item] = item;
      }
    });

    let rows = fileBody.map((item) => {
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
        {fileBody.length > 0 ? (
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
