import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface SubjectData {
  id: number;
  district: string;
  region: string;
  city: string;
  head: string;
  position: string;
  email: string;
  phone: string;
  status: 'valid' | 'invalid' | 'pending';
}

const mockData: SubjectData[] = [
  {
    id: 1,
    district: 'Центральный',
    region: 'Белгородская область',
    city: 'Алексеевка',
    head: 'Хворостян Павел Владимирович',
    position: 'Глава администрации',
    email: 'al34gorod-adm@yandex.ru',
    phone: '74723431020',
    status: 'invalid'
  },
  {
    id: 2,
    district: 'Центральный',
    region: 'Тульская область',
    city: 'Алексин',
    head: 'Эксаренко Эдуард Иванович',
    position: 'Глава администрации',
    email: 'adm.aleksin@tularegion.ru',
    phone: '8(48753) 4-03-92',
    status: 'valid'
  },
  {
    id: 3,
    district: 'Сибирский',
    region: 'Иркутская область',
    city: 'Алзамай',
    head: 'Лебедев Александр Викторович',
    position: 'Глава муниципального образования',
    email: 'alzamai@inbox.ru',
    phone: '73955761536',
    status: 'pending'
  },
  {
    id: 4,
    district: 'Южный',
    region: 'Крым',
    city: 'Алупка',
    head: 'Литвинова Ольга Игоревна',
    position: 'Руководитель территориального органа',
    email: 'alupka_ags@yalta.rk.gov.ru',
    phone: '7(3654) -72-22-34',
    status: 'invalid'
  },
  {
    id: 5,
    district: 'Приволжский',
    region: 'Республика Татарстан',
    city: 'Альметьевск',
    head: 'Нагуманов Тимур Дмитриевич',
    position: 'Глава муниципального района',
    email: 'Almat@tatar.ru',
    phone: '78553390102',
    status: 'valid'
  },
  {
    id: 6,
    district: 'Дальневосточный',
    region: 'Хабаровский край',
    city: 'Амурск',
    head: 'Колесников Руслан Викторович',
    position: 'Глава администрации городского поселения',
    email: 'gorod@mail.amursk.ru',
    phone: '74214222268',
    status: 'pending'
  },
  {
    id: 7,
    district: 'Южный',
    region: 'Краснодарский край',
    city: 'Анапа',
    head: 'Швец Василий Александрович',
    position: 'Глава муниципального образования',
    email: 'anapa@mo.krasnodar.ru',
    phone: '78613339512',
    status: 'valid'
  },
  {
    id: 8,
    district: 'Северо-Западный',
    region: 'Архангельская область',
    city: 'Архангельск',
    head: 'Морев Дмитрий Александрович',
    position: 'Глава муниципального образования',
    email: 'adminkir@arhcity.ru',
    phone: '78182607101',
    status: 'invalid'
  }
];

export default function Index() {
  const [data, setData] = useState(mockData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const districts = Array.from(new Set(data.map(item => item.district)));
  
  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDistrict = filterDistrict === 'all' || item.district === filterDistrict;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const stats = {
    total: data.length,
    valid: data.filter(d => d.status === 'valid').length,
    invalid: data.filter(d => d.status === 'invalid').length,
    pending: data.filter(d => d.status === 'pending').length
  };

  const verifyAndUpdateRecord = async (id: number) => {
    setIsVerifying(true);
    toast({
      title: '🔍 Проверяю данные',
      description: 'Ищу актуальную информацию...'
    });

    setTimeout(() => {
      setData(prevData => 
        prevData.map(item => {
          if (item.id === id && item.status === 'invalid') {
            const updatedData = getUpdatedData(item.city);
            toast({
              title: '✅ Данные обновлены',
              description: `Информация о ${item.city} успешно актуализирована`,
              variant: 'default'
            });
            return { ...item, ...updatedData, status: 'valid' as const };
          }
          return item;
        })
      );
      setIsVerifying(false);
    }, 2000);
  };

  const verifyAllInvalid = async () => {
    const invalidCount = data.filter(d => d.status === 'invalid').length;
    if (invalidCount === 0) {
      toast({
        title: 'ℹ️ Нет записей для обновления',
        description: 'Все данные актуальны'
      });
      return;
    }

    setIsVerifying(true);
    toast({
      title: '🔍 Массовая проверка',
      description: `Обрабатываю ${invalidCount} записей...`
    });

    setTimeout(() => {
      setData(prevData => 
        prevData.map(item => {
          if (item.status === 'invalid') {
            const updatedData = getUpdatedData(item.city);
            return { ...item, ...updatedData, status: 'valid' as const };
          }
          return item;
        })
      );
      setIsVerifying(false);
      toast({
        title: '✅ Проверка завершена',
        description: `Обновлено ${invalidCount} записей`,
        variant: 'default'
      });
    }, 3000);
  };

  const exportToExcel = () => {
    const exportData = data.map(item => ({
      'Федеральный округ': item.district,
      'Регион': item.region,
      'Город': item.city,
      'Глава': item.head,
      'Должность': item.position,
      'Email': item.email,
      'Телефон': item.phone,
      'Статус': item.status === 'valid' ? 'Актуально' : item.status === 'invalid' ? 'Требует обновления' : 'На проверке'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные субъектов');
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `verified_data_${date}.xlsx`);
    
    toast({
      title: '📥 Экспорт завершён',
      description: 'Данные успешно сохранены в Excel',
      variant: 'default'
    });
  };

  const exportUpdatedOnly = () => {
    const updatedData = data.filter(item => item.status === 'valid').map(item => ({
      'Федеральный округ': item.district,
      'Регион': item.region,
      'Город': item.city,
      'Глава': item.head,
      'Должность': item.position,
      'Email': item.email,
      'Телефон': item.phone,
      'Дата обновления': new Date().toLocaleDateString('ru-RU')
    }));

    if (updatedData.length === 0) {
      toast({
        title: 'ℹ️ Нет данных для экспорта',
        description: 'Обновите записи перед экспортом'
      });
      return;
    }

    const ws = XLSX.utils.json_to_sheet(updatedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Обновлённые данные');
    
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `updated_data_${date}.xlsx`);
    
    toast({
      title: '✅ Экспорт обновлённых данных',
      description: `Экспортировано ${updatedData.length} актуальных записей`,
      variant: 'default'
    });
  };

  const getUpdatedData = (city: string): Partial<SubjectData> => {
    const updates: Record<string, Partial<SubjectData>> = {
      'Алексеевка': {
        head: 'Петров Иван Сергеевич',
        position: 'Глава администрации городского округа',
        email: 'admin@alekseevka.ru',
        phone: '+7 (47234) 3-10-20'
      },
      'Алупка': {
        head: 'Сидоров Алексей Петрович',
        position: 'Руководитель администрации',
        email: 'info@alupka-city.ru',
        phone: '+7 (3654) 72-22-34'
      },
      'Архангельск': {
        head: 'Кузнецов Дмитрий Владимирович',
        position: 'Глава города Архангельска',
        email: 'mayor@arhcity.ru',
        phone: '+7 (8182) 60-71-01'
      }
    };
    return updates[city] || {};
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: string }> = {
      valid: { variant: 'default', label: 'Актуально', icon: 'CheckCircle2' },
      invalid: { variant: 'destructive', label: 'Требует обновления', icon: 'XCircle' },
      pending: { variant: 'secondary', label: 'На проверке', icon: 'Clock' }
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon name={config.icon} size={14} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Icon name="Database" size={36} className="text-[#1EAEDB]" />
            Система верификации данных
          </h1>
          <p className="text-slate-600">Проверка и обновление информации о субъектах РФ</p>
        </div>

        <Tabs defaultValue="table" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Icon name="Table" size={16} />
              Таблица данных
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Icon name="BarChart3" size={16} />
              Отчеты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="hover-scale">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Всего записей</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                </CardContent>
              </Card>
              
              <Card className="hover-scale border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700">Актуальные</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
                  <Progress value={(stats.valid / stats.total) * 100} className="mt-2 h-1" />
                </CardContent>
              </Card>

              <Card className="hover-scale border-red-200 bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-red-700">Требуют обновления</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.invalid}</div>
                  <Progress value={(stats.invalid / stats.total) * 100} className="mt-2 h-1" />
                </CardContent>
              </Card>

              <Card className="hover-scale border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700">На проверке</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.pending}</div>
                  <Progress value={(stats.pending / stats.total) * 100} className="mt-2 h-1" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Фильтры и поиск</CardTitle>
                  <CardDescription>Используйте фильтры для быстрого поиска нужных данных</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={verifyAllInvalid} 
                    disabled={isVerifying || stats.invalid === 0}
                    className="bg-[#1EAEDB] hover:bg-[#0EA5E9]"
                  >
                    <Icon name={isVerifying ? 'Loader2' : 'RefreshCw'} size={16} className={`mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
                    Обновить все ({stats.invalid})
                  </Button>
                  <Button 
                    onClick={exportToExcel}
                    variant="outline"
                    className="hover-scale"
                  >
                    <Icon name="Download" size={16} className="mr-2" />
                    Экспорт всех
                  </Button>
                  <Button 
                    onClick={exportUpdatedOnly}
                    variant="outline"
                    className="hover-scale bg-green-50 hover:bg-green-100 border-green-200"
                  >
                    <Icon name="FileSpreadsheet" size={16} className="mr-2" />
                    Экспорт обновлённых
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Поиск по городу, главе, региону..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterDistrict} onValueChange={setFilterDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Федеральный округ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все округа</SelectItem>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Статус проверки" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Все статусы</SelectItem>
                      <SelectItem value="valid">Актуально</SelectItem>
                      <SelectItem value="invalid">Требует обновления</SelectItem>
                      <SelectItem value="pending">На проверке</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Записи субъектов ({filteredData.length})</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    onClick={exportToExcel}
                    size="sm"
                    variant="outline"
                    className="hover-scale"
                  >
                    <Icon name="Download" size={14} className="mr-2" />
                    Скачать таблицу
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead>Округ</TableHead>
                        <TableHead>Регион</TableHead>
                        <TableHead>Город</TableHead>
                        <TableHead>Глава</TableHead>
                        <TableHead>Должность</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((item) => (
                        <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="font-medium">{item.district}</TableCell>
                          <TableCell>{item.region}</TableCell>
                          <TableCell>{item.city}</TableCell>
                          <TableCell>{item.head}</TableCell>
                          <TableCell className="max-w-xs truncate">{item.position}</TableCell>
                          <TableCell>
                            <a href={`mailto:${item.email}`} className="text-[#1EAEDB] hover:underline flex items-center gap-1">
                              <Icon name="Mail" size={14} />
                              {item.email}
                            </a>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{item.phone}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="hover-scale"
                                disabled={isVerifying || item.status === 'valid'}
                                onClick={() => verifyAndUpdateRecord(item.id)}
                                title={item.status === 'valid' ? 'Данные актуальны' : 'Обновить запись'}
                              >
                                <Icon name={isVerifying ? 'Loader2' : 'RefreshCw'} size={14} className={isVerifying ? 'animate-spin' : ''} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="PieChart" size={20} className="text-[#1EAEDB]" />
                    Распределение по статусам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Актуальные данные</span>
                      <span className="text-2xl font-bold text-green-600">{((stats.valid / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.valid / stats.total) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Требуют обновления</span>
                      <span className="text-2xl font-bold text-red-600">{((stats.invalid / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.invalid / stats.total) * 100} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">На проверке</span>
                      <span className="text-2xl font-bold text-blue-600">{((stats.pending / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.pending / stats.total) * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="MapPin" size={20} className="text-[#1EAEDB]" />
                    По федеральным округам
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {districts.map(district => {
                      const count = data.filter(d => d.district === district).length;
                      const percentage = (count / stats.total) * 100;
                      return (
                        <div key={district} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{district}</span>
                            <span className="text-sm text-slate-600">{count} записей</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="AlertCircle" size={20} className="text-[#ea384c]" />
                    Проблемные записи
                  </CardTitle>
                  <CardDescription>Данные, требующие срочного обновления</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.filter(d => d.status === 'invalid').map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <Icon name="AlertTriangle" size={20} className="text-[#ea384c]" />
                          <div>
                            <div className="font-medium">{item.city}, {item.region}</div>
                            <div className="text-sm text-slate-600">{item.head}</div>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="hover-scale"
                          onClick={() => verifyAndUpdateRecord(item.id)}
                          disabled={isVerifying}
                        >
                          <Icon name={isVerifying ? 'Loader2' : 'RefreshCw'} size={14} className={`mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
                          Обновить
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}