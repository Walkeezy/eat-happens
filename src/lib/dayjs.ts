import dayjs from 'dayjs';
import 'dayjs/locale/de';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);
dayjs.locale('de');

export { dayjs };
