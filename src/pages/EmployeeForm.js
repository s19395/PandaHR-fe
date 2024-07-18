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
import moment from 'moment';
import dayjs from 'dayjs';

const steps = ['Pracownik', 'Dokumenty', 'Przegląd'];
const initialFormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  typeOfContract: '',
  street: '',
  zipcode: '',
  city: '',
  position: '',
  signedAt: '',
  validFrom: '',
  validTo: '',
  hourlyRate: '',
  bonusEnabled: false,
  bonus: '',
  bonusThreshold: ''
};

const CreateEmployee = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState({});
  const [positions, setPositions] = useState([]);
  const [contracts, setContracts] = useState([]);
  const requestWithNotification = useRequestWithNotification();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contracts, positions] = await Promise.all([
        requestWithNotification('get', '/employees/employmentContracts'),
        requestWithNotification('get', '/positions/findActive')
      ]);
      setContracts(contracts);
      setPositions(positions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleChange = (field) => (event) => {
    setFormValues({ ...formValues, [field]: event.target.value });
  };

  const handleCheckboxChange = (field) => (event) => {
    setFormValues({ ...formValues, [field]: event.target.checked });
  };

  const validateStep = (step) => {
    let newErrors = {};
    if (step === 0) {
      if (!formValues.firstName) newErrors.firstName = 'Imię jest wymagane';
      if (!formValues.lastName) newErrors.lastName = 'Nazwisko jest wymagane';
      if (!formValues.dateOfBirth) newErrors.dateOfBirth = 'Data urodzenia jest wymagana';
      if (!formValues.typeOfContract) newErrors.typeOfContract = 'Rodzaj umowy jest wymagany';
      // if (!formValues.address) newErrors.address = 'Address is required';
      // if (!formValues.position) newErrors.position = 'Position is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormValues({});
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    const employeeDto = transformValuesToEmployeeDto(formValues);
    const contractDto = transformValuesToContractDto(formValues);

    await requestWithNotification('post', `/employees/createWithContract`, {
      employeeDto,
      contractDto
    });
    handleReset();
  };

  function transformValuesToEmployeeDto(formValues) {
    return {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      dateOfBirth: formValues.dateOfBirth,
      employmentContract: formValues.typeOfContract,
      street: formValues.street,
      zipCode: formValues.zipcode,
      city: formValues.city
    };
  }

  function transformValuesToContractDto(formValues) {
    const positionDto = positions.find((position) => position.title === formValues.position);

    return {
      positionDto: positionDto,
      signedAt: formValues.signedAt,
      validFrom: formValues.validFrom,
      validTo: formValues.validTo
    };
  }

  return (
    <Dialog open={open} onClose={handleReset} maxWidth="md" fullWidth>
      <DialogTitle>Nowy pracownik</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ mt: 2 }}>
          {activeStep === 0 && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Imię"
                    fullWidth
                    value={formValues.firstName}
                    onChange={handleChange('firstName')}
                    margin="normal"
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Nazwisko"
                    fullWidth
                    value={formValues.lastName}
                    onChange={handleChange('lastName')}
                    margin="normal"
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Data urodzenia"
                type="date"
                fullWidth
                value={formValues.dateOfBirth}
                onChange={handleChange('dateOfBirth')}
                margin="normal"
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{
                  shrink: true
                }}
                InputProps={{
                  inputProps: { min: '1900-01-01', max: moment().format('YYYY-MM-DD') }
                }}
              />
              <TextField
                label="Rodzaj umowy"
                fullWidth
                select
                value={formValues.typeOfContract}
                onChange={handleChange('typeOfContract')}
                margin="normal"
                error={!!errors.typeOfContract}
                helperText={errors.typeOfContract}>
                {contracts.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Ulica"
                fullWidth
                value={formValues.street}
                onChange={handleChange('street')}
                margin="normal"
                error={!!errors.street}
                helperText={errors.street}
              />
              <>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      label="Kod pocztowy"
                      fullWidth
                      value={formValues.zipcode}
                      onChange={handleChange('zipcode')}
                      margin="normal"
                      error={!!errors.zipcode}
                      helperText={errors.zipcode}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <TextField
                      label="Miasto"
                      fullWidth
                      value={formValues.city}
                      onChange={handleChange('city')}
                      margin="normal"
                      error={!!errors.city}
                      helperText={errors.city}
                    />
                  </Grid>
                </Grid>
              </>
            </Box>
          )}
          {activeStep === 1 && (
            <Box>
              <TextField
                label="Stanowisko"
                fullWidth
                select
                value={formValues.position}
                onChange={handleChange('position')}
                margin="normal"
                error={!!errors.position}
                helperText={errors.position}>
                <MenuItem value="">
                  <Typography variant="body1">Brak</Typography>
                </MenuItem>
                {positions.map((position) => (
                  <MenuItem key={position.title} value={position.title}>
                    {position.title}
                  </MenuItem>
                ))}
              </TextField>
              {(formValues.position || formValues.typeOfContract === 'Pełny etat') && (
                <>
                  <TextField
                    label="Podpisano w dniu"
                    type="date"
                    fullWidth
                    value={formValues.signedAt}
                    onChange={handleChange('signedAt')}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true
                    }}
                    InputProps={{
                      inputProps: { min: '1900-01-01' }
                    }}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Data od"
                        type="date"
                        fullWidth
                        value={formValues.validFrom}
                        onChange={handleChange('validFrom')}
                        margin="normal"
                        InputLabelProps={{
                          shrink: true
                        }}
                        InputProps={{
                          inputProps: { min: '1900-01-01' }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Data do"
                        type="date"
                        fullWidth
                        value={formValues.validTo}
                        onChange={handleChange('validTo')}
                        margin="normal"
                        InputLabelProps={{
                          shrink: true
                        }}
                        InputProps={{
                          inputProps: { min: '1900-01-01' }
                        }}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="Stawka godzinowa"
                    type="number"
                    fullWidth
                    value={formValues.hourlyRate}
                    onChange={handleChange('hourlyRate')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">zł/h</InputAdornment>,
                      inputProps: { min: 0, max: 100 }
                    }}
                  />
                  <FormControlLabel
                    label="Premia"
                    control={
                      <Checkbox
                        checked={formValues.bonusEnabled}
                        onChange={handleCheckboxChange('bonusEnabled')}
                      />
                    }
                  />{' '}
                </>
              )}
              {formValues.bonusEnabled && (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Premia"
                        type="number"
                        fullWidth
                        value={formValues.bonus}
                        onChange={handleChange('bonus')}
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">zł/dzień</InputAdornment>,
                          inputProps: { min: 0, max: 1000 }
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Liczba dni weekendowych do premii"
                        type="number"
                        fullWidth
                        value={formValues.bonusThreshold}
                        onChange={handleChange('bonusThreshold')}
                        margin="normal"
                        InputProps={{
                          endAdornment: <InputAdornment position="end">dni</InputAdornment>,
                          inputProps: { min: 0, max: 10 }
                        }}
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          )}
          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Divider />
                <Box mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DetailItem title="Imię" content={formValues.firstName} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem title="Nazwisko" content={formValues.lastName} />
                    </Grid>
                    <Grid item xs={12}>
                      <DetailItem title="Data urodzenia:" content={formValues.dateOfBirth} />
                    </Grid>
                    <Grid item xs={12}>
                      <DetailItem title="Rodzaj umowy:" content={formValues.typeOfContract} />
                    </Grid>
                    <Grid item xs={12}>
                      <DetailItem
                        title="Adres:"
                        content={`
                          ${formValues.zipcode ? formValues.zipcode + ' ' : ''}
                          ${formValues.city ? formValues.city + ', ' : ''}
                          ${formValues.street ? formValues.street : ''}
                      `}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Divider variant="middle" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem title="Stanowisko:" content={formValues.position} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem
                        title="Podpisano dnia:"
                        content={dayjs(formValues.signedAt).format('DD.MM.YYYY')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem
                        title="Data od:"
                        content={dayjs(formValues.validFrom).format('DD.MM.YYYY')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem
                        title="Data do:"
                        content={dayjs(formValues.validTo).format('DD.MM.YYYY')}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DetailItem
                        title="Premia:"
                        content={formValues.bonusEnabled ? 'Tak' : 'Nie'}
                      />
                    </Grid>
                    {formValues.bonusEnabled && (
                      <>
                        <Grid item xs={12}>
                          <Divider variant="middle" />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DetailItem title="Stawka godzinowa:" content={formValues.hourlyRate} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DetailItem title="Premia:" content={formValues.bonus} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <DetailItem
                            title="Liczba dni weekendowych do premii:"
                            content={formValues.bonusThreshold}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} color="primary" variant="contained">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Submit
          </Button>
        )}
        <Button onClick={handleReset}>Cancel</Button>
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
