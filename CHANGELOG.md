## 1.0.0-smed (09.08.2022)
- `feature` Переименовывание пакетов. Исправлена конфигурация для публикации

## 5.0.0 (17.09.2018)
- Переход на 14 ядро презентации.
- Переход на 7 версию сервиса аутентификации.

## 4.1.1 (24.08.2018)
- `(bugfix)` BUG124213: [Задачи] Скриптовая ошибка при попытке отобразить список задач пользователя/подразделений, содержащий задачу без ФИО клиента 

## 4.1.0 (10.08.2018)
- `(bugfix)` BUG123959: [Задачи][Клиенты] Отсутствует боковое меню при переходе к исполнению заявки на создание/редактирование клиента
- `(bugfix)` BUG123964: [Задачи][Оформление доверенности] Отсутствует боковое меню при переходе к исполнению заявки
- `(bugfix)` BUG123963: [Задачи][Переводы] Отсутствует боковое меню при переходе к исполнению переводов
- `(bugfix)` BUG123961: [Задачи][Переоформление вклада] Отсутствует боковое меню при переходе к исполнению заявки на переоформление вклада
- `(feature)` В `bpm-aggregation-service` добавлено отображение ФИО клиента, в "Тестовый модуль BPM. Клиенты. Заглушка" в создание таска добавлено проставление субъекта

## 4.0.0 (03.08.2018)
- `(bugfix)` Исправлен способ передачи параметров в запросе на возврат задачи в пул
- Переход на 12 ядро презентации.
- Переход на 6 версию сервиса аутентификации.

## 3.2.1 (02.08.2018)
- В запросах назначения задачи на сотрудника и возврат задачи в пул передаются идентификаторы задачи 
- В запросе на получение списка сотрудников на странице "Задачи подразделения" передается подразделение сотрудника вместо филиала  
- Название модуля агрегации списка задач изменено на `bpm-aggregation-service`  

## 3.2.0 (02.08.2018)
- `(breaking change)` модуль `bpm-presentation` переименован в `web-presentation-bpm-tasks-aggregation`
- `(feature)` Заглушка для модуля агрегации списка задач перенесена в модуль `web-presentation-module-bpm-mock`

  [Описание заглушки (createTasksAggregationMock)](/packages/web-presentation-module-bpm-mock/src/index.js)  
  [Регистрация заглушки](/packages/web-presentation-test-module-deposits-dev/mocks.config.js)  
  [Подключение модуля агрегации и добавление пункта меню "Задачи" в режиме разработки](/packages/web-presentation-test-module-deposits-dev/dev.app.config.js)    
- `(feature)` В `withBPM` добавлены функции:
    - Вернуть задачу в пул: `returnTasks`
    - Назначить задачу на исполнителя:`takeTasks`
    - Получить иоформацию о задаче:`getTaskInfo`
    - Перейти к исполнению задачи:`openTask`
    
## 3.1.0 (27.07.2018)
- поднята версия @efr/web-presentation-authentification до ^5.0.0
- добавлен новый модуль `@efr/bpm-presentation` (Презентационный слой модуля агрегации bpm-задач)

- `@efr/web-presentation-module-bpm`
  - `(feature)` Добавлена обработка для случая, когда активный такс не приходит.

## 3.0.0 (11.07.2018)
- Обновлено ядро до версии 11.0.0
- `@efr/web-presentation-module-bpm`
  - `(remove)` Удалено определение маппинга параметров дефолтной стартовой страницы (`paramsToContextMapping`).
  - `(feature)` Добавлена возможность задать параметры дефолтной стартовой страницы через функцию `paramsResolver` (в параметрах вся информация о процессе).
        Если ее нет, то в параметры страницы передается субъект процесса.
        [пример 1 (без определения функции)](/packages/web-presentation-test-module-deposits/src/bpm/open-deposit-process/index.js)
        [пример 2 (с определением явной функции)](/packages/web-presentation-test-module-clients/src/bpm/create-client-process/index.js)

  - `(feature)` Добавлена функция (`bpmRelation`) для указания зависимостей (`related`) пунктов меню от bpm.
- `@efr/web-presentation-module-bpm-mock`
  - `(feature)` Добавлена функция (`context.setSubject`) для указания субъекта процесса bpm (см. [mock](/packages/web-presentation-test-module-deposits-mock/src/index.js)).

## 2.0.0 (26.06.2018)
- Обновлено ядро до версии 10.0.0 

## 1.1.0 (06.06.2018)
- `@efr/web-presentation-module-bpm`
  - Реализована возможность использования одинаковых ключей задач для разных процессов/подпроцессов.
  
## 1.0.1 (01.06.2018)
- `@efr/web-presentation-module-bpm-mock`
  - Исправлена ошибка запуска подпроцессов без пользовательских задач.

## 1.0.0 (15.05.2018)
-  Переезд из проекта http://git.dos.softlab.ru/RSHB/EFR/presentation/web-presentation-core
- `@efr/web-presentation-module-bpm`
 - `(breaking change)` заглушки перенесены в новый выделенный модуль `@efr/web-presentation-module-bpm-mock`  
      вместо `import bpmModuleMockConfig from '@efr/web-presentation-module-bpm/mocks.config'`  
      следует использовать `import bpmModuleMockConfig from '@efr/web-presentation-module-bpm-mock'` 
    - `(breaking change)` при описании процесса функция `userTaskComponent` на вход принимает ключ задачи.  
      Идентификатор формы не используется. 
    - `(breaking change)` при описании заглушки процесса функция userTask теперь принимает 2 параметра вместо 3.  
      Второй параметр (идентификатор формы) следует удалить.
    - `(breaking change)` Измененен объект, передаваемый в функцию описания процесса  
       было `const createClientProcessDefinition = processDefinition => {`  
       стало `const createClientProcessDefinition = ({processDefinition}) => {`
    - `(breaking change)` Изменен HOC `withBPM`. Пример использования:  
        _было_

        ```javascript
           ...
              createClient = () => {
                  this.props.clientsBPM.startProcess(CREATE_CLIENT_PROCESS_KEY, {
                      "systemId": "BISQUIT:6300"
                  })
              };     
           export default compose(
                  withBPM({
                       clientsBPM: MODULE_NAME
                  }),
              )(BpmTestPage)
        ```
        _стало_

        ```javascript
              createClient = () => {
                  this.props.bpm.startProcess(MODULE_NAME, CREATE_CLIENT_PROCESS_KEY, {
                      "systemId": "BISQUIT:6300"
                  })
              };        
           export default compose(
                  withBPM
              )(BpmTestPage)
        ```
    - `(feature)` Добавлена поддержка подпроцессов.  
       [Пример описания процесса/подпроцесса](/packages/web-presentation-test-module-clients/src/bpm/create-client-process/index.js)  
       [Пример описания заглушки](/packages/web-presentation-test-module-clients-mock/src/index.js)

