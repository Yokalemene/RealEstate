import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Container, Grid, TextField, Button, Typography, MenuItem, Box, Paper, FormControl, InputLabel, Select } from '@mui/material';
import axios from 'axios';
import './ReportForm.css';

const propertyTypes = [
  { value: 'Квартира', label: 'Квартира' },
  { value: 'Комната', label: 'Комната' },
  { value: 'Дом, дача, коттедж', label: 'Дом, дача, коттедж' },
  { value: 'Земельный участок', label: 'Земельный участок' },
  { value: 'Гараж и машиноместо', label: 'Гараж и машиноместо' },
  { value: 'Другое', label: 'Другое' },
];

const ReportForm = ({ applicationId, onSubmit }) => {
  const { handleSubmit, control, reset } = useForm({
    defaultValues: {
      clientName: '',
      propertyType: '',
      location: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      description: '',
      rating: 1,
    },
  });

  const onSubmitForm = async (data) => {
    try {
      const reportData = {
        clientName: data.clientName,
        propertyType: data.propertyType,
        location: data.location,
        price: data.price,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        description: data.description,
        rating: data.rating,
      };
      console.log('Submitting report data:', reportData);

      const response = await axios.post(`http://localhost:5000/api/employee/applications/${applicationId}/create-report`, reportData);
      console.log('Report creation response:', response);

      // Обновить статус заявки на "Завершено"
      await axios.put(`http://localhost:5000/api/employee/applications/${applicationId}/update-status`, { status: 'Завершено' });

      alert('Отчет успешно создан!');
      reset();
      if (typeof onSubmit === 'function') {
        onSubmit();
      }
    } catch (error) {
      console.error('Ошибка при создании отчета:', error);
      alert(`Произошла ошибка при создании отчета: ${error.response ? error.response.data.message : error.message}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Форма отчета
        </Typography>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="clientName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ФИО собственника"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Тип недвижимости</InputLabel>
                <Controller
                  name="propertyType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Тип недвижимости"
                    >
                      {propertyTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Местоположение"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Цена (руб.)"
                    type="number"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Спальни (кол-во)"
                    type="number"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="bathrooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ванные (кол-во)"
                    type="number"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Площадь (м²)"
                    type="number"
                    fullWidth
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Описание"
                    fullWidth
                    multiline
                    rows={4}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="rating"
                control={control}
                rules={{ required: true, min: 1, max: 10 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Общий балл недвижимости (1-10)"
                    type="number"
                    fullWidth
                    required
                    inputProps={{ min: 1, max: 10 }}
                    onKeyDown={(e) => {
                      if (e.key === '.' || e.key === '-') {
                        e.preventDefault();
                      }
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
          <Box textAlign="center" mt={4}>
            <Button type="submit" variant="contained" color="primary" size="large">
              Создать отчет
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default ReportForm;
