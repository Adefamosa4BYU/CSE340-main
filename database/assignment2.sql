-- Data for Table Account
INSERT INTO public.account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');


-- Making Changes in Account Table
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';


-- Delete Record in Account Table
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';


-- Make changes in Inventory Table
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';


--inner join to select the make and model fields from the inventory table
SELECT i.inv_make, i.inv_model, c.classification_name
FROM inventory i
INNER JOIN classification c
ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';


-- Update all records in the inventory table to add "/vehicles"
UPDATE inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');


-- Create a Review Database
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    inv_id INT NOT NULL REFERENCES inventory(inv_id),
    account_id INT NOT NULL REFERENCES account(account_id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


