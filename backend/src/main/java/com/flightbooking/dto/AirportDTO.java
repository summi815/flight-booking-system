@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AirportDTO {
    private String id;
    private String code;
    private String name;
    private String city;
    private String country;
   () {
        return code + " - " + name + " (" + city + ", " + country + ")";
    }
}