import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Grid,
  Card,
  CardContent,
  MenuItem,
  InputAdornment,
  Divider
} from '@mui/material';
import { useRequestWithNotification } from '../helper/AxiosHelper';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { step0Schema, step1Schema } from './validationSchema';

const steps = ['Pracownik', 'Dokumenty', 'Przegląd'];
const initialFormValues = {
  firstName: '',
  lastName: '',
  position: '',
  hourlyRate: null,
  bonus: null,
  bonusThreshold: null,
  street: '',
  zipcode: '',
  city: '',
  typeOfContract: 'Umowa Zlecenie',
  dateOfBirth: dayjs(),
  signedAt: dayjs(),
  validFrom: dayjs(),
  validTo: dayjs(),
  bonusEnabled: false
};

const CreateEmployee = ({ open, onClose, onEmployeeCreated }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [positions, setPositions] = useState([]);
  const [contracts, setContracts] = useState([]);
  const requestWithNotification = useRequestWithNotification();

  const resolver = (step) => {
    return yupResolver(step === 0 ? step0Schema : step1Schema);
  };

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    trigger
  } = useForm({
    defaultValues: initialFormValues,
    resolver: resolver(activeStep)
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Re-run validation schema on step change
    trigger();
  }, [activeStep, trigger]);

  const fetchData = async () => {
    try {
      const [contracts, positions] = await Promise.all([
        requestWithNotification('get', '/employees/employmentContracts'),
        requestWithNotification('get', '/positions/active')
      ]);
      setContracts(contracts);
      setPositions(positions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (isValid) {
      if (activeStep === steps.length - 1) {
        handleSubmit(handleSubmitForm)();
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1); // Move to next step
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    reset(initialFormValues);
    onClose();
  };

  const handleSubmitForm = async (data) => {
    try {
      const employeeDto = transformValuesToEmployeeDto(data);
      const contractDto = transformValuesToContractDto(data);

      await requestWithNotification('post', `/employees/createWithContract`, {
        employeeDto,
        contractDto
      });
      onEmployeeCreated({ employeeDto });
      handleReset();
    } catch (error) {
      console.error('Error creating employee:', error);
    }
  };

  const transformValuesToEmployeeDto = (data) => ({
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    employmentContract: data.typeOfContract,
    street: data.street,
    zipCode: data.zipcode,
    city: data.city
  });

  const transformValuesToContractDto = (data) => {
    const positionDto = positions.find((position) => position.name === data.position);

    return {
      positionDto: positionDto,
      signedAt: data.signedAt,
      validFrom: data.validFrom,
      validTo: data.validTo,
      earningConditionsDto: {
        hourlyRate: data.hourlyRate,
        bonusEnabled: data.bonusEnabled,
        bonus: data.bonus,
        bonusThreshold: data.bonusThreshold
      }
    };
  };

  return (
    <Dialog open={open} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>Nowy pracownik</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step
              key={label}
              sx={{
                '& .MuiStepLabel-root .Mui-completed': {
                  color: 'secondary.dark'
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: 'secondary.main'
                }
              }}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 2 }}>
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="firstName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Imię"
                        fullWidth
                        {...field}
                        margin="normal"
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="lastName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Nazwisko"
                        fullWidth
                        {...field}
                        margin="normal"
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Data urodzenia"
                    sx={{ mt: 2, mb: 2 }}
                    {...field}
                    onChange={(date) => setValue('dateOfBirth', date)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.dateOfBirth}
                        helperText={errors.dateOfBirth?.message}
                      />
                    )}
                  />
                )}
              />
              <Controller
                name="typeOfContract"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Rodzaj umowy"
                    fullWidth
                    select
                    {...field}
                    margin="normal"
                    error={!!errors.typeOfContract}
                    helperText={errors.typeOfContract?.message}>
                    {contracts.map((value) => (
                      <MenuItem key={value} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="street"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Ulica"
                    fullWidth
                    {...field}
                    margin="normal"
                    error={!!errors.street}
                    helperText={errors.street?.message}
                  />
                )}
              />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Controller
                    name="zipcode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Kod pocztowy"
                        fullWidth
                        {...field}
                        margin="normal"
                        error={!!errors.zipcode}
                        helperText={errors.zipcode?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={8}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        label="Miasto"
                        fullWidth
                        {...field}
                        margin="normal"
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Controller
                name="position"
                control={control}
                render={({ field }) => (
                  <TextField
                    label="Stanowisko"
                    fullWidth
                    select
                    {...field}
                    margin="normal"
                    error={!!errors.position}
                    helperText={errors.position?.message}>
                    {positions.map((position) => (
                      <MenuItem key={position.name} value={position.name}>
                        {position.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              {(watch('position') || watch('typeOfContract') === 'Umowa zlecenie') && (
                <Controller
                  name="hourlyRate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label="Stawka godzinowa"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">PLN</InputAdornment>
                      }}
                      {...field}
                      margin="normal"
                      error={!!errors.hourlyRate}
                      helperText={errors.hourlyRate?.message}
                    />
                  )}
                />
              )}
              {(watch('typeOfContract') === 'Umowa o pracę' || watch('position')) && (
                <>
                  <Controller
                    name="signedAt"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        label="Podpisano w dniu"
                        sx={{ mt: 2, mb: 2 }}
                        {...field}
                        onChange={(date) => setValue('signedAt', date)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={!!errors.signedAt}
                            helperText={errors.signedAt?.message}
                          />
                        )}
                      />
                    )}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Controller
                          name="validFrom"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              label="Data rozpoczęcia"
                              sx={{ mt: 2, mb: 2 }}
                              {...field}
                              onChange={(date) => setValue('validFrom', date)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={!!errors.validFrom}
                                  helperText={errors.validFrom?.message}
                                />
                              )}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Controller
                          name="validTo"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              label="Data zakończenia"
                              sx={{ mt: 2, mb: 2 }}
                              {...field}
                              onChange={(date) => setValue('validTo', date)}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  fullWidth
                                  error={!!errors.validTo}
                                  helperText={errors.validTo?.message}
                                />
                              )}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                  <Controller
                    name="bonusEnabled"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label="Premia"
                      />
                    )}
                  />
                  {watch('bonusEnabled') && (
                    <>
                      <Controller
                        name="bonus"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label="Kwota premii"
                            type="number"
                            fullWidth
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PLN</InputAdornment>
                            }}
                            {...field}
                            margin="normal"
                            error={!!errors.bonus}
                            helperText={errors.bonus?.message}
                          />
                        )}
                      />
                      <Controller
                        name="bonusThreshold"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            label="Próg premii"
                            type="number"
                            fullWidth
                            InputProps={{
                              startAdornment: <InputAdornment position="start">PLN</InputAdornment>
                            }}
                            {...field}
                            margin="normal"
                            error={!!errors.bonusThreshold}
                            helperText={errors.bonusThreshold?.message}
                          />
                        )}
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          )}
          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Divider sx={{ ml: 2, mr: 2 }} />
                <Box mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailItem title="Imię" content={watch('firstName')} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem title="Nazwisko" content={watch('lastName')} />
                    </Grid>
                    {watch('dateOfBirth') && (
                      <>
                        <Grid item xs={12}>
                          <DetailItem
                            title="Data urodzenia"
                            content={dayjs(watch('dateOfBirth')).format('DD.MM.YYYY')}
                          />
                        </Grid>
                      </>
                    )}
                    {watch('typeOfContract') && (
                      <>
                        <Grid item xs={12}>
                          <DetailItem title="Rodzaj umowy" content={watch('typeOfContract')} />
                        </Grid>
                      </>
                    )}
                    {(watch('zipcode') || watch('city') || watch('street')) && (
                      <>
                        <Grid item xs={12}>
                          <DetailItem
                            title="Adres"
                            content={`
                              ${watch('zipcode') ? watch('zipcode') + ' ' : ''}
                              ${watch('city') ? watch('city') + ', ' : ''}
                              ${watch('street') ? watch('street') : ''}
                            `}
                          />
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12}>
                      <Divider variant="middle" />
                    </Grid>
                    {watch('position') && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <DetailItem title="Stanowisko" content={watch('position')} />
                        </Grid>
                        {watch('signedAt') && (
                          <>
                            <Grid item xs={12} sm={6}>
                              <DetailItem
                                title="Podpisano dnia"
                                content={dayjs(watch('signedAt')).format('DD.MM.YYYY')}
                              />
                            </Grid>
                          </>
                        )}
                        {watch('validFrom') && (
                          <>
                            <Grid item xs={12} sm={6}>
                              <DetailItem
                                title="Data od"
                                content={dayjs(watch('validFrom')).format('DD.MM.YYYY')}
                              />
                            </Grid>
                          </>
                        )}
                        {watch('validTo') && (
                          <>
                            <Grid item xs={12} sm={6}>
                              <DetailItem
                                title="Data do"
                                content={dayjs(watch('validTo')).format('DD.MM.YYYY')}
                              />
                            </Grid>
                          </>
                        )}
                        <Grid item xs={12} sm={6}>
                          <DetailItem
                            title="Premia"
                            content={watch('bonusEnabled') ? 'Tak' : 'Nie'}
                          />
                        </Grid>
                        {watch('bonusEnabled') && (
                          <>
                            <Grid item xs={12}>
                              <Divider variant="middle" />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <DetailItem title="Stawka godzinowa" content={watch('hourlyRate')} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <DetailItem title="Premia" content={watch('bonus')} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <DetailItem
                                title="Liczba dni weekendowych do premii"
                                content={watch('bonusThreshold')}
                              />
                            </Grid>
                          </>
                        )}
                      </>
                    )}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ mr: 2 }}>
        <Button onClick={handleReset}>Anuluj</Button>
        <Button onClick={handleBack} disabled={activeStep === 0}>
          Wstecz
        </Button>
        <Button onClick={handleNext} color="secondary" variant="contained">
          {activeStep === steps.length - 1 ? 'Zapisz' : 'Dalej'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const DetailItem = ({ title, content }) => {
  return (
    <>
      <Typography variant="subtitle1" color="textSecondary">
        <strong>{title}:</strong>
      </Typography>
      <Typography variant="body1">{content}</Typography>
    </>
  );
};

export default CreateEmployee;
