import * as Yup from 'yup';

// Define the schema for Step 0
export const step0Schema = Yup.object({
  firstName: Yup.string().required('Imię jest wymagane'),
  lastName: Yup.string().required('Nazwisko jest wymagane'),
  dateOfBirth: Yup.date().nullable().required('Data urodzenia jest wymagana dla Umowy Zlecenie'),
  typeOfContract: Yup.string().required('Typ umowy jest wymagany'),
  street: Yup.string().when('typeOfContract', {
    is: 'Umowa Zlecenie',
    then: (schema) => schema.required('Ulica jest wymagana dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  zipcode: Yup.string().when('typeOfContract', {
    is: 'Umowa Zlecenie',
    then: (schema) => schema.required('Kod pocztowy wymagany dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  city: Yup.string().when('typeOfContract', {
    is: 'Umowa Zlecenie',
    then: (schema) => schema.required('Miasto jest wymagane dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  })
});

// Define the schema for Step 1
export const step1Schema = Yup.object({
  position: Yup.string().when('typeOfContract', {
    is: 'Umowa Zlecenie',
    then: (schema) => schema.required('Stanowisko jest wymagane dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  signedAt: Yup.date().when(['typeOfContract', 'position'], {
    is: (typeOfContract, position) => typeOfContract === 'Umowa Zlecenie' && position,
    then: (schema) => schema.required('Data podpisania umowy jest wymagana dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  validFrom: Yup.date().when(['typeOfContract', 'position'], {
    is: (typeOfContract, position) => typeOfContract === 'Umowa Zlecenie' && position,
    then: (schema) => schema.required('Data od jest wymagana dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  validTo: Yup.date().when(['typeOfContract', 'position'], {
    is: (typeOfContract, position) => typeOfContract === 'Umowa Zlecenie' && position,
    then: (schema) => schema.required('Data do jest wymagana dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  hourlyRate: Yup.number()
    .min(0, 'Stawka godzinowa nie może być ujemna')
    .when('typeOfContract', {
      is: 'Umowa Zlecenie',
      then: (schema) => schema.required('Stawka godzinowa jest wymagana dla Umowy Zlecenie'),
      otherwise: (schema) => schema.nullable()
    }),
  bonus: Yup.number()
    .min(0, 'Premia nie może być ujemna')
    .when('bonusEnabled', {
      is: true,
      then: (schema) => schema.required('Premia jest wymagana gdy bonus jest aktywny'),
      otherwise: (schema) => schema.nullable()
    }),
  bonusThreshold: Yup.number()
    .min(0, 'Próg premii nie może być ujemny')
    .max(10, 'Próg premii nie może przekraczać 10%')
    .when('bonusEnabled', {
      is: true,
      then: (schema) =>
        schema.required('Liczba dni weekendowych do premii jest wymagana gdy bonus jest aktywny'),
      otherwise: (schema) => schema.nullable()
    })
});
