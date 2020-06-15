package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

func main() {
	// err := godotenv.Load()
	// if err != nil {
	// 	log.Print("Error loading .env file")
	// }

	// usersRepo := users.NewRepo()
	// usersHandler := &handlers.UsersHandler{
	// 	UsersRepo: usersRepo,
	// }

	// gamesRepo := games.NewRepo()
	// gamesHandler := &handlers.GamesHandler{
	// 	GamesRepo: gamesRepo,
	// }

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization"},
	})

	r := mux.NewRouter()
	r.PathPrefix("/").Handler(http.StripPrefix("/", http.FileServer(http.Dir("../template/"))))

	handler := c.Handler(r)
	http.Handle("/", r)
	fmt.Println("Listening on http://localhost:8080")
	http.ListenAndServe("0.0.0.0:8080", handler)
	// err = http.ListenAndServe(":"+os.Getenv("PORT"), handler)
	// if err != nil {
	// 	panic(err)
	// }
}
