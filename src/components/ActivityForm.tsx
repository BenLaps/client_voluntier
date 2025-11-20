// src/components/ActivityForm.tsx

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Control } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Zod схема, щоб вона містила фінансові реквізити
const formSchema = z.object({
  title: z.string().min(4, { message: "Title must be at least 4 characters." }),
  imageUrl: z.array(z.object({ value: z.string().url({ message: "Please enter a valid URL" }) })),
  shortDescription: z.string().min(50, { message: "Description must be at least 50 characters." }),
  socialContactURL: z.array(z.object({ value: z.string().url({ message: "Please enter a valid URL" }) })),
  city: z.string().min(4, { message: "City must be at least 4 characters." }),
  tags: z.string().min(1, { message: "Tag must be selected." }),
  requestType: z.string(),
  volunteersNeeded: z.string().optional(),
  financialRequisites: z.object({
    card_number: z.string().optional(),
    bank_name: z.string().optional(),
    recipient_name: z.string().optional(),
  }).optional(),
});

// Визначаємо тип даних форми
export type ActivityFormValues = z.infer<typeof formSchema>;

// Визначаємо пропси для нашого компонента
interface ActivityFormProps {
  onSubmit: (values: ActivityFormValues) => Promise<void>; // Функція, що викликається при сабміті
  initialValues?: ActivityFormValues; // Початкові дані (для редагування)
  isLoading: boolean; // Для блокування кнопки
}

//  Компонент Форми 
export function ActivityForm({ onSubmit, initialValues, isLoading }: ActivityFormProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues || {
      title: "",
      imageUrl: [{ value: "" }],
      shortDescription: "",
      socialContactURL: [{ value: "" }],
      city: "",
      tags: "",
      requestType: "financial",
      volunteersNeeded: "",
      financialRequisites: { card_number: "", bank_name: "", recipient_name: "" },
    },
  });

  const requestType = form.watch("requestType");

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control, name: "imageUrl",
  });
  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control: form.control, name: "socialContactURL",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl w-full">
        
        {/* --- Статичні Поля --- */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Збір на дрони..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl><Input placeholder="Львів" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       {/* --- Динамічні Поля Зображень --- */}
        <div>
          <FormLabel>Image URLs</FormLabel>
          {imageFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`imageUrl.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-2">
                  <FormControl>
                    <Input placeholder="https://imgur.com/..." {...field} />
                  </FormControl>
                  {imageFields.length > 1 && ( // Кнопка видалення
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeImage(index)}>
                      Remove
                    </Button>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendImage({ value: "" })}>
            Add Image
          </Button>
        </div>

        {/* --- Динамічні Поля Соцмереж --- */}
        <div>
          <FormLabel>Social Contact URLs</FormLabel>
          {socialFields.map((field, index) => (
            <FormField
              key={field.id}
              control={form.control}
              name={`socialContactURL.${index}.value`}
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-2">
                  <FormControl>
                    <Input placeholder="https://facebook.com/..." {...field} />
                  </FormControl>
                  {socialFields.length > 1 && ( // Кнопка видалення
                    <Button type="button" variant="destructive" size="sm" onClick={() => removeSocial(index)}>
                      Remove
                    </Button>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSocial({ value: "" })}>
            Add Social Link
          </Button>
        </div>

        {/* --- Поле Опису --- */}
        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Детальний опис потреби..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* --- Поле Тегу --- */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tag</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть тег" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tags</SelectLabel>
                    <SelectItem value="army">Army</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="environment">Environment</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="medicament">Medicament</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
       {/* --- Перемикач Типу Запиту --- */}
        <FormField
          control={form.control}
          name="requestType"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Тип запиту</FormLabel>
                <FormDescription>Виберіть, що вам потрібно: фінанси чи волонтери.</FormDescription>
              </div>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="financial">Фінанси</SelectItem>
                  <SelectItem value="volunteer">Волонтери</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* --- Умовне Поле для Волонтерів --- */}
        {requestType === 'volunteer' && (
          <FormField
            control={form.control}
            name="volunteersNeeded"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Кількість волонтерів</FormLabel>
                <FormControl><Input placeholder="Наприклад: 5, 1-10, 10+" {...field} /></FormControl>
                <FormDescription>Вкажіть приблизну кількість потрібних волонтерів.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

      {/* --- Умовні Поля для Фінансів --- */}
        {requestType === 'financial' && (
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-lg font-medium">Фінансові реквізити</h3>
            <FormField control={form.control} name="financialRequisites.card_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер картки</FormLabel>
                  <FormControl><Input placeholder="5168 1111 2222 3333" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="financialRequisites.bank_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Назва банку</FormLabel>
                  <FormControl><Input placeholder="Monobank" {...field} /></FormControl>
                </FormItem>
              )}
            />
            <FormField control={form.control} name="financialRequisites.recipient_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ім'я отримувача</FormLabel>
                  <FormControl><Input placeholder="Процак Роман" {...field} /></FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* --- Кнопка Підтвердження --- */}
        <Button type="submit" disabled={isLoading} className={"w-full"}>
          {isLoading ? "Надсилання..." : (initialValues ? "Оновити активність" : "Створити активність")}
        </Button>
      </form>
    </Form>
  );
}