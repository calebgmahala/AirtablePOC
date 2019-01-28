-- replica db
CREATE TABLE albums
(
    id SERIAL PRIMARY KEY,
    title varchar(64) NOT NULL,
    artist varchar(64) NOT NULL,
    url varchar(128),
    image varchar(128),
    thumbnail_image varchar(128)
);
INSERT INTO albums
    (title, artist, url, image, thumbnail_image)
VALUES
    ('Taylor Swift', 'Taylor Swift', 'https://www.amazon.com/Taylor-Swift/dp/B0014I4KH6', 'https://images-na.ssl-images-amazon.com/images/I/61McsadO1OL.jpg', 'https://i.imgur.com/K3KJ3w4h.jpg');
INSERT INTO albums
    (title, artist, url, image, thumbnail_image)
VALUES
    ('Fearless', 'Taylor Swift', 'https://www.amazon.com/Fearless-Enhanced-Taylor-Swift/dp/B001EYGOEM', 'https://images-na.ssl-images-amazon.com/images/I/51qmhXWZBxL.jpg', 'https://i.imgur.com/K3KJ3w4h.jpg');
INSERT INTO albums
    (title, artist, url, image, thumbnail_image)
VALUES
    ('Speak Now', 'Taylor Swift', 'https://www.amazon.com/Speak-Now-Taylor-Swift/dp/B003WTE886', 'https://images-na.ssl-images-amazon.com/images/I/51vlGuX7%2BFL.jpg', 'https://i.imgur.com/K3KJ3w4h.jpg');
INSERT INTO albums
    (title, artist, url, image, thumbnail_image)
VALUES
    ('Red', 'Taylor Swift', 'https://www.amazon.com/Red-Taylor-Swift/dp/B008XNZMOU', 'https://images-na.ssl-images-amazon.com/images/I/41j7-7yboXL.jpg', 'https://i.imgur.com/K3KJ3w4h.jpg');
INSERT INTO albums
    (title, artist, url, image, thumbnail_image)
VALUES
    ('1989', 'Taylor Swift', 'https://www.amazon.com/1989-Taylor-Swift/dp/B00MRHANNI', 'https://images-na.ssl-images-amazon.com/images/I/717DWgRftmL._SX522_.jpg', 'https://i.imgur.com/K3KJ3w4h.jpg');
-- better db

CREATE OR REPLACE FUNCTION trigger_set_timestamp
()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedat = NOW
();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE artists
(
    id SERIAL PRIMARY KEY,
    name varchar(64) NOT NULL,
    image varchar(128),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deletedAT TIMESTAMPTZ
);

CREATE TRIGGER set_timestamp
BEFORE
UPDATE ON artists
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp
();

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    username varchar(64) NOT NULL,
    password varchar(64) NOT NULL,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deletedAT TIMESTAMPTZ
);

CREATE TRIGGER set_timestamp
BEFORE
UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp
();

CREATE TABLE albums
(
    id SERIAL PRIMARY KEY,
    title varchar(64) NOT NULL,
    artistId integer NOT NULL REFERENCES artists(id),
    url varchar(128) NOT NULL,
    image varchar(128),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deletedAT TIMESTAMPTZ
);

CREATE TRIGGER set_timestamp
BEFORE
UPDATE ON albums
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp
();

CREATE TABLE user_albums
(
    id SERIAL PRIMARY KEY,
    userId integer NOT NULL REFERENCES users(id),
    albumId integer NOT NULL REFERENCES albums(id),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deletedAT TIMESTAMPTZ
);

CREATE TRIGGER set_timestamp
BEFORE
UPDATE ON user_albums
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp
();

INSERT INTO artists
    (name, image)
VALUES
    ('Taylor Swift', 'https://i.imgur.com/K3KJ3w4h.jpg');
INSERT INTO artists
    (name, image)
VALUES
    ('U2', 'https://i.pinimg.com/originals/fa/59/95/fa5995d0fcf93db97bb51be536c80baa.png');

INSERT INTO users
    (username, password)
VALUES
    ('Caleb', 'root');
INSERT INTO users
    (username, password)
VALUES
    ('Test', 'root');

INSERT INTO albums
    (title, artistid, url, image)
VALUES
    ('Taylor Swift', 1, 'https://www.amazon.com/Taylor-Swift/dp/B0014I4KH6', 'https://images-na.ssl-images-amazon.com/images/I/61McsadO1OL.jpg');
INSERT INTO albums
    (title, artistid, url, image)
VALUES
    ('Fearless', 1, 'https://www.amazon.com/Fearless-Enhanced-Taylor-Swift/dp/B001EYGOEM', 'https://images-na.ssl-images-amazon.com/images/I/51qmhXWZBxL.jpg');
INSERT INTO user_albums
    (userid, albumid)
VALUES
    (1, 1);
INSERT INTO user_albums
    (userid, albumid)
VALUES
    (1, 2);