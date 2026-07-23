import { formatDisplayValue } from '../utils/displayValue';

const RECORDS = [
  ['standingLongJump', '제자리멀리뛰기'],
  ['backStrength', '배근력'],
  ['shuttleRun10m', '10m왕복달리기'],
  ['medicineBall', '메디신볼던지기'],
  ['sitAndReach', '좌전굴(선택)'],
];

export function RecordList({ records = {} }) {
  return (
    <section className="record-list" aria-labelledby="record-list-title">
      <h2 id="record-list-title">기록</h2>
      <dl>
        {RECORDS.map(([key, label]) => (
          <div className="record-list__row" key={key} role="group">
            <dt>{label}</dt>
            <dd>{formatDisplayValue(records[key])}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
