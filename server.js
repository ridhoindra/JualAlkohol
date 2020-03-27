const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')
const port = 3000

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "jualalkohol"
  });
  db.connect(err => {
    if (err) throw err;
    console.log("Database connected");
  });

  const isAuthorized = (request, result, next) => {
    if (typeof request.headers["token"] == "undefined") {
      return result.status(403).json({
        success: false,
        message: "Silahkan Login terlebih dahulu"
      });
    }
  
    let token = request.headers["token"];
  
    jwt.verify(token, "SuperSecRetKey", (err, decoded) => {
      if (err) {
        return result.status(401).json({
          success: false,
          message: "Silahkan login terlebih dahulu"
        });
      }
    });
  
    next();
  };

app.post("/login/admin", (req, res, next) => {
    //membuat end point untuk login akun
    var username = req.body.username; // mengimpor email dari form
    var password = req.body.password; //mengimpor password dari form
    const sql = "SELECT * FROM admin WHERE username = ? AND password = ?"; // mencocokkan data form dengan data tabel
    if (username && password) {
      // jika email dan password ada
      db.query(sql, [username, password], function(err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
          jwt.sign(
            { username, password },
            "SuperSecRetKey",
            {
              expiresIn: 60 * 60 * 6
            },
            (err, token) => {
              res.send(token);
            }
          );
        } else {
          res.json({
            message: "Username atau Password salah"
          }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
  });



//   User

app.post("/login", (req, res) => {
    //membuat end point untuk login akun
    var email = req.body.email; // mengimpor email dari form
    var password = req.body.password; //mengimpor password dari form
    const sql = "SELECT * FROM akun WHERE email = ? AND password = ?"; // mencocokkan data form dengan data tabel
    if (email && password) {
      // jika email dan password ada
      db.query(sql, [email, password], function(err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
          // jika kolom lebih dari 0
          jwt.sign(
            // mengenkripsi data menggunakan jwt
            { email, password },
            "SuperSecRetKey",
            {
              expiresIn: 60 * 60 * 7 // waktu durasi token yang dikeluarkan
            },
            (err, token) => {
              res.send(token); // menampilkan token yang sudah ada
            }
          );
        } else {
          res.json({
            message: "Email atau Password salah"
          }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
  });
  

app.post("/daftar", (req, res) => {
    // membuat end point untuk daftar akun
    var data = {
      // membuat variabel data
      nama: req.body.nama, // mengambil data nama dari form
      email: req.body.email, // mengambil data email dari form
      password: req.body.password, // mengambil data password dari form
      no_telp: req.body.telepon,
      alamat: req.body.alamat
    };
    db.query("INSERT INTO akun SET?", data, function(err, result) {
      // memasukkan data form ke tabel database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          message: "Data user masuk"
        });
      }
    });
  });
  
  app.put("/editUser/:id",isAuthorized, function(req, res) {
    let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
      'UPDATE akun SET nama="' +
      req.body.nama +
      '", alamat="' +
      req.body.alamat +
      '", password="' +
      req.body.password +
      '", no_telp="' +
      req.body.telepon +
      '", email="' +
      req.body.email +
      '" where id=' +
      req.params.id;
    db.query(data, function(err, result) {
      // mengupdate data di database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          success: true,
          message: "Data berhasil diupdate",
          data: result
        });
      }
    });
  });
  
  app.delete("/deleteUser/:id",isAuthorized, function(req, res) {
    // membuat end point delete
    let id = "delete from akun where id=" + req.params.id;
  
    db.query(id, function(err, result) {
      // mengupdate data di database
      if (err) throw err;
      // jika gagal maka akan keluar error
      else {
        res.json({
          success: true,
          message: "Data berhasil dihapus",
          data: result
        });
      }
    });
  });



  // CRUD BARANG KEMAH

app.post("/barang",isAuthorized, function(request, result) {
  let data = request.body;

  var barang = {
    // membuat variabel data untuk menampung data dari form
    namaBarang: data.namaBarang, // mengambil data dari form
    deskripsi: data.deskripsi, // mengambil data dari form
    stok: data.stok,
    harga: data.harga // mengambil data dari form
  };

  db.query("insert into barang set ?", barang, (err, result) => {
    if (err) throw err;
  });

  result.json({
    success: true,
    message: "Data barang telah masuk"
  });
});

app.put("/barang/:id",isAuthorized, function(req, res) {
  let data = // membuat variabel data yang berisi sintaks untuk mengupdate tabel di database
    'UPDATE barang SET namaBarang="' +
    req.body.namaBarang +
    '", deskripsi="' +
    req.body.deskripsi +
    '", stok="' +
    req.body.stok +
    '", harga="' +
    req.body.harga +
    '" where id=' +
    req.params.id;
  db.query(data, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data berhasil diupdate"
      });
    }
  });
});

app.delete("/barang/:id",isAuthorized, function(req, res) {
  // membuat end point delete
  let id = "delete from barang where id=" + req.params.id;

  db.query(id, function(err, result) {
    // mengupdate data di database
    if (err) throw err;
    // jika gagal maka akan keluar error
    else {
      res.json({
        success: true,
        message: "Data berhasil dihapus"
      });
    }
  });
});

app.get("/barang",isAuthorized, (req, res) => {
  db.query(`select * from barang`,
    (err, result) => {
      if (err) throw err;

      res.json({
        message: "berhasil menampilkan data",
        data: result
      });
    }
  );
});

app.get("/barang/:id",isAuthorized, (req, res) => {
  db.query(`select * from barang where id=`+req.params.id,
    (err, result) => {
      if (err) throw err;

      res.json({
        message: "berhasil menampilkan data dengan id = "+req.params.id,
        data: result
      });
    }
  );
});



// CRUD TRANSAKSI

app.post("/barang/:id/beli", isAuthorized, (req, res) => {
  let data = req.body;
  db.query(`select * from barang where id =`+req.params.id,(err,result)=>{
    if (err) throw err;

    if(result.length <= 0){
      res.json({
        success: false,
        message: 'Tidak ada barang dengan id '+ req.params.id
      })
    }else{
      let barang = result[0]
      db.query(
        `
          insert into transaksi (id_akun, id_barang, jumlah, harga, total_harga, metode_pembayaran)
          values ('` +
          data.id_akun +
          `', '` +
          req.params.id +
          `', '` +
          data.jumlah +
          `', '` +
          barang.harga +
          `', '` +
          data.jumlah +
          `' * '` +
          barang.harga +
          `', '` +
          data.metode +
          `')
          `,
        (err, result) => {
          if (err) throw err;
        }
      );
    
      db.query(
        `
          update barang
          set stok = stok - '` +
          data.jumlah +
          `'
          where id = '` +
          req.params.id +
          `'
          `,
        (err, result) => {
          if (err) throw err;
        }
      );
    
      res.json({
        message: barang.namaBarang+" berhasil dibeli dengan jumlah "+data.jumlah+" dan total harga "+data.jumlah*barang.harga+" dibayar dengan membayar melalui "+data.metode
      });
      
    }
  })


});

app.get("/transaksi", isAuthorized, (req, res) => {
  // let data = req.params.id;
  db.query(`select * from transaksi`,
    (err, result) => {
      if (err) throw err;

      res.json({
        message: "berhasil menampilkan data transaksi",
        data: result
      });
    }
  );
});

app.get("/transaksi/users/:id", isAuthorized, (req, res) => {
  // let data = req.params.id;
  db.query(`select * from transaksi where transaksi.id_akun = `+req.params.id,
    (err, result) => {
      if (err) throw err;

      res.json({
        message: "berhasil menampilkan data transaksi dengan id user = "+req.params.id,
        data: result
      });
    }
  );
});

app.get("/transaksi/barang/:id", isAuthorized, (req, res) => {
  // let data = req.params.id;
  db.query(`select * from transaksi where transaksi.id_barang = `+req.params.id,
    (err, result) => {
      if (err) throw err;

      res.json({
        message: "berhasil menampilkan data transaksi dengan id barang = "+req.params.id,
        data: result
      });
    }
  );
});

app.delete("/transaksi/batal/:id", isAuthorized, function(req, res) {
  // membuat end point delete

  db.query('select * from transaksi where id='+req.params.id,(err,result)=>{
    if(err) throw err;

    if(result.length <= 0){
      res.json({
        success: false,
        message: 'Tidak ada transaksi dengan id '+ req.params.id
      })
    }else{
      let transaksi = result[0]

      db.query(
        `
          update barang
          set stok = stok + '` +
          transaksi.jumlah +
          `'
          where id = '` +
          transaksi.id_barang +
          `'
          `,
        (err, result) => {
          if (err) throw err;
        }
      );

      db.query('delete from transaksi where id='+req.params.id, function(err, result) {
        // mengupdate data di database
        if (err) throw err;
        // jika gagal maka akan keluar error
        else {
          res.json({
            success: true,
            message: "Transaksi berhasil dibatalkan"
          });
        }
      });
    }
  })
});

app.listen(port, () => console.log(`NIKI SERVER E MLAMPAH TEN PORT 3000 :v`))