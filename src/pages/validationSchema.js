import * as Yup from 'yup';

// Define the schema for Step 0
export const step0Schema = Yup.object({
  firstName: Yup.string().required('Imię jest wymagane'),
  lastName: Yup.string().required('Nazwisko jest wymagane'),
  typeOfContract: Yup.string().required('Typ umowy jest wymagany'),
  dateOfBirth: Yup.date()
    .min(new Date(1900, 0, 1), 'Data urodzenia musi być po 01.01.1900')
    .max(new Date().getFullYear() - 18, 'Pracownik musi mieć ukończone 18 lat')
    .when('typeOfContract', {
      is: 'Umowa Zlecenie',
      then: (schema) => schema.required('Data urodzenia jest wymagana dla Umowy Zlecenie'),
      otherwise: (schema) => schema.nullable()
    }),
  street: Yup.string().when('typeOfContract', {
    is: 'Umowa Zlecenie',
    then: (schema) => schema.required('Ulica jest wymagana dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  zipcode: Yup.string()
    .matches(/^\d{2}-\d{3}$/, 'Kod pocztowy musi być w formacie XX-XXX')
    .when('typeOfContract', {
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
    then: (schema) => schema.required('Data rozpoczęcia jest wymagana dla Umowy Zlecenie'),
    otherwise: (schema) => schema.nullable()
  }),
  validTo: Yup.date()
    .when(['typeOfContract', 'position'], {
      is: (typeOfContract, position) => typeOfContract === 'Umowa Zlecenie' && position,
      then: (schema) => schema.required('Data do jest wymagana dla Umowy Zlecenie'),
      otherwise: (schema) => schema.nullable()
    })
    .when('validFrom', (validFrom, schema) => {
      return validFrom
        ? schema.min(validFrom, 'Data zakończenia musi być po dacie rozpoczęcia')
        : schema;
    }),
  hourlyRate: Yup.number()
    .min(0, 'Stawka godzinowa nie może być ujemna')
    .max(1000, 'Stawka godzinowa nie może przekraczać 1000 PLN')
    .when('typeOfContract', {
      is: 'Umowa Zlecenie',
      then: (schema) => schema.required('Stawka godzinowa jest wymagana dla Umowy Zlecenie'),
      otherwise: (schema) => schema.nullable()
    }),
  bonus: Yup.number()
    .min(0, 'Premia nie może być ujemna')
    .max(1000, 'Premia nie może przekraczać 1000 PLN')
    .when('bonusEnabled', {
      is: true,
      then: (schema) => schema.required('Premia jest wymagana gdy bonus jest aktywny'),
      otherwise: (schema) => schema.nullable()
    }),
  bonusThreshold: Yup.number()
    .min(0, 'Próg premii nie może być ujemny')
    .max(10, 'Próg premii nie może przekraczać 10 dni')
    .when('bonusEnabled', {
      is: true,
      then: (schema) =>
        schema.required('Liczba dni weekendowych do premii jest wymagana gdy bonus jest aktywny'),
      otherwise: (schema) => schema.nullable()
    })
});
